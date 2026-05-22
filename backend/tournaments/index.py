import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p6853430_yakuza_52_site')
ROLE_WEIGHT = {'owner': 4, 'admin': 3, 'member': 2, 'recruit': 1}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization',
    }

def get_caller(event: dict):
    token = _extract_token(event)
    if not token:
        return None
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"SELECT p.id, p.role FROM {SCHEMA}.sessions s JOIN {SCHEMA}.players p ON p.id = s.player_id WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    conn.close()
    return {'id': row[0], 'role': row[1]} if row else None

def handler(event: dict, context) -> dict:
    """CRUD турниров и регистрация участников"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    parts = [p for p in path.strip('/').split('/') if p]

    if method == 'GET' and (not parts or not parts[-1].isdigit()):
        return list_tournaments(event)

    if method == 'POST' and (not parts or not parts[-1].isdigit()):
        return create_tournament(event)

    if parts and parts[-1].isdigit():
        t_id = int(parts[-1])
        if method == 'GET':
            return get_tournament(t_id)
        if method == 'PUT':
            return update_tournament(event, t_id)
        if method == 'POST' and len(parts) >= 2 and parts[-2].isdigit() and 'register' in path:
            return register(event, t_id)

    if 'register' in path and parts:
        for p in parts:
            if p.isdigit():
                return register(event, int(p))

    return {'statusCode': 404, 'headers': cors_headers(), 'body': json.dumps({'error': 'Not found'})}


def list_tournaments(event: dict) -> dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"""SELECT t.id, t.title, t.description, t.date, t.time_start, t.type, t.status,
                   t.max_participants, t.prize,
                   COUNT(r.id) as participants
            FROM {SCHEMA}.tournaments t
            LEFT JOIN {SCHEMA}.tournament_registrations r ON r.tournament_id = t.id
            GROUP BY t.id ORDER BY t.date ASC, t.time_start ASC"""
    )
    rows = cur.fetchall()
    conn.close()
    tournaments = []
    for r in rows:
        tournaments.append({
            'id': r[0], 'title': r[1], 'description': r[2],
            'date': str(r[3]), 'time': r[4], 'type': r[5], 'status': r[6],
            'maxParticipants': r[7], 'prize': r[8], 'participants': r[9],
        })
    return {'statusCode': 200, 'headers': cors_headers(), 'body': json.dumps({'tournaments': tournaments})}


def get_tournament(t_id: int) -> dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"SELECT id, title, description, date, time_start, type, status, max_participants, prize FROM {SCHEMA}.tournaments WHERE id = %s", (t_id,))
    r = cur.fetchone()
    if not r:
        conn.close()
        return {'statusCode': 404, 'headers': cors_headers(), 'body': json.dumps({'error': 'Не найден'})}
    cur.execute(f"SELECT player_id FROM {SCHEMA}.tournament_registrations WHERE tournament_id = %s", (t_id,))
    reg_ids = [row[0] for row in cur.fetchall()]
    conn.close()
    return {'statusCode': 200, 'headers': cors_headers(), 'body': json.dumps({
        'tournament': {
            'id': r[0], 'title': r[1], 'description': r[2],
            'date': str(r[3]), 'time': r[4], 'type': r[5], 'status': r[6],
            'maxParticipants': r[7], 'prize': r[8],
            'participants': len(reg_ids), 'registeredIds': reg_ids,
        }
    })}


def create_tournament(event: dict) -> dict:
    caller = get_caller(event)
    if not caller or ROLE_WEIGHT.get(caller['role'], 0) < ROLE_WEIGHT['admin']:
        return {'statusCode': 403, 'headers': cors_headers(), 'body': json.dumps({'error': 'Только админы могут создавать турниры'})}

    body = json.loads(event.get('body') or '{}')
    for f in ['title', 'date', 'time', 'type']:
        if not body.get(f):
            return {'statusCode': 400, 'headers': cors_headers(), 'body': json.dumps({'error': f'Поле {f} обязательно'})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"""INSERT INTO {SCHEMA}.tournaments (title, description, date, time_start, type, status, max_participants, prize, created_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
        (body['title'], body.get('description'), body['date'], body['time'],
         body['type'], body.get('status', 'upcoming'), body.get('maxParticipants', 10),
         body.get('prize'), caller['id'])
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    conn.close()
    return {'statusCode': 201, 'headers': cors_headers(), 'body': json.dumps({'id': new_id})}


def update_tournament(event: dict, t_id: int) -> dict:
    caller = get_caller(event)
    if not caller or ROLE_WEIGHT.get(caller['role'], 0) < ROLE_WEIGHT['admin']:
        return {'statusCode': 403, 'headers': cors_headers(), 'body': json.dumps({'error': 'Нет доступа'})}

    body = json.loads(event.get('body') or '{}')
    updates = []
    params = []
    field_map = {'title': 'title', 'description': 'description', 'date': 'date',
                 'time': 'time_start', 'type': 'type', 'status': 'status',
                 'maxParticipants': 'max_participants', 'prize': 'prize'}
    for key, col in field_map.items():
        if key in body:
            updates.append(f"{col} = %s")
            params.append(body[key])

    if not updates:
        return {'statusCode': 400, 'headers': cors_headers(), 'body': json.dumps({'error': 'Нечего обновлять'})}

    params.append(t_id)
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"UPDATE {SCHEMA}.tournaments SET {', '.join(updates)} WHERE id = %s", params)
    conn.commit()
    conn.close()
    return {'statusCode': 200, 'headers': cors_headers(), 'body': json.dumps({'ok': True})}


def register(event: dict, t_id: int) -> dict:
    caller = get_caller(event)
    if not caller:
        return {'statusCode': 401, 'headers': cors_headers(), 'body': json.dumps({'error': 'Не авторизован'})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"SELECT status, max_participants FROM {SCHEMA}.tournaments WHERE id = %s", (t_id,))
    t = cur.fetchone()
    if not t:
        conn.close()
        return {'statusCode': 404, 'headers': cors_headers(), 'body': json.dumps({'error': 'Не найден'})}
    if t[0] != 'upcoming':
        conn.close()
        return {'statusCode': 400, 'headers': cors_headers(), 'body': json.dumps({'error': 'Регистрация закрыта'})}

    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.tournament_registrations WHERE tournament_id = %s", (t_id,))
    count = cur.fetchone()[0]
    if count >= t[1]:
        conn.close()
        return {'statusCode': 400, 'headers': cors_headers(), 'body': json.dumps({'error': 'Турнир заполнен'})}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action', 'register')

    if action == 'unregister':
        cur.execute(f"UPDATE {SCHEMA}.tournament_registrations SET player_id = player_id WHERE tournament_id = %s AND player_id = %s", (t_id, caller['id']))
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': cors_headers(), 'body': json.dumps({'ok': True, 'registered': False})}

    try:
        cur.execute(f"INSERT INTO {SCHEMA}.tournament_registrations (tournament_id, player_id) VALUES (%s, %s)", (t_id, caller['id']))
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': cors_headers(), 'body': json.dumps({'ok': True, 'registered': True})}
    except Exception:
        conn.rollback()
        conn.close()
        return {'statusCode': 409, 'headers': cors_headers(), 'body': json.dumps({'error': 'Уже зарегистрирован'})}


def _extract_token(event: dict) -> str:
    auth = event.get('headers', {}).get('X-Authorization') or event.get('headers', {}).get('authorization', '')
    if auth.startswith('Bearer '):
        return auth[7:]
    cookies = event.get('headers', {}).get('X-Cookie') or event.get('headers', {}).get('cookie', '')
    for part in cookies.split(';'):
        part = part.strip()
        if part.startswith('clan_token='):
            return part[11:]
    return ''
