import json
import os
import hashlib
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

def hash_password(p: str) -> str:
    return hashlib.sha256(p.encode()).hexdigest()

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
    if row:
        return {'id': row[0], 'role': row[1]}
    return None

def handler(event: dict, context) -> dict:
    """CRUD участников клана"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    parts = [p for p in path.strip('/').split('/') if p]
    player_id = int(parts[-1]) if parts and parts[-1].isdigit() else None

    if method == 'GET' and not player_id:
        return list_players(event)
    if method == 'GET' and player_id:
        return get_player(player_id)
    if method == 'POST':
        return create_player(event)
    if method == 'PUT' and player_id:
        return update_player(event, player_id)

    return {'statusCode': 404, 'headers': cors_headers(), 'body': json.dumps({'error': 'Not found'})}


def list_players(event: dict) -> dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"""SELECT id, nickname, standoff_id, role, points, kills, deaths, wins, losses,
                   bio, region, is_online, joined_at
            FROM {SCHEMA}.players ORDER BY points DESC"""
    )
    rows = cur.fetchall()
    conn.close()
    players = []
    for i, r in enumerate(rows):
        kd = round(r[5] / max(r[6], 1), 2)
        players.append({
            'id': r[0], 'nickname': r[1], 'standoffId': r[2], 'role': r[3],
            'rank': i + 1, 'points': r[4], 'kills': r[5], 'deaths': r[6],
            'wins': r[7], 'losses': r[8], 'kd': kd,
            'bio': r[9], 'region': r[10], 'isOnline': r[11],
            'joinedAt': str(r[12]) if r[12] else None,
        })
    return {'statusCode': 200, 'headers': cors_headers(), 'body': json.dumps({'players': players})}


def get_player(player_id: int) -> dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"""SELECT id, nickname, standoff_id, role, points, kills, deaths, wins, losses,
                   bio, region, is_online, joined_at
            FROM {SCHEMA}.players WHERE id = %s""",
        (player_id,)
    )
    r = cur.fetchone()
    conn.close()
    if not r:
        return {'statusCode': 404, 'headers': cors_headers(), 'body': json.dumps({'error': 'Не найден'})}
    kd = round(r[5] / max(r[6], 1), 2)
    player = {
        'id': r[0], 'nickname': r[1], 'standoffId': r[2], 'role': r[3],
        'points': r[4], 'kills': r[5], 'deaths': r[6],
        'wins': r[7], 'losses': r[8], 'kd': kd,
        'bio': r[9], 'region': r[10], 'isOnline': r[11],
        'joinedAt': str(r[12]) if r[12] else None,
    }
    return {'statusCode': 200, 'headers': cors_headers(), 'body': json.dumps({'player': player})}


def create_player(event: dict) -> dict:
    caller = get_caller(event)
    if not caller or ROLE_WEIGHT.get(caller['role'], 0) < ROLE_WEIGHT['admin']:
        return {'statusCode': 403, 'headers': cors_headers(), 'body': json.dumps({'error': 'Нет доступа'})}

    body = json.loads(event.get('body') or '{}')
    required = ['login', 'password', 'nickname', 'role']
    for f in required:
        if not body.get(f):
            return {'statusCode': 400, 'headers': cors_headers(), 'body': json.dumps({'error': f'Поле {f} обязательно'})}

    if ROLE_WEIGHT.get(body['role'], 0) >= ROLE_WEIGHT.get(caller['role'], 0):
        return {'statusCode': 403, 'headers': cors_headers(), 'body': json.dumps({'error': 'Нельзя создать участника с равной или выше ролью'})}

    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            f"""INSERT INTO {SCHEMA}.players (login, password_hash, nickname, standoff_id, role, bio, region)
                VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id""",
            (body['login'], hash_password(body['password']), body['nickname'],
             body.get('standoffId'), body['role'], body.get('bio'), body.get('region'))
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {'statusCode': 201, 'headers': cors_headers(), 'body': json.dumps({'id': new_id})}
    except Exception as e:
        conn.rollback()
        conn.close()
        return {'statusCode': 409, 'headers': cors_headers(), 'body': json.dumps({'error': 'Логин или никнейм уже занят'})}


def update_player(event: dict, player_id: int) -> dict:
    caller = get_caller(event)
    if not caller:
        return {'statusCode': 401, 'headers': cors_headers(), 'body': json.dumps({'error': 'Не авторизован'})}

    is_self = caller['id'] == player_id
    is_admin = ROLE_WEIGHT.get(caller['role'], 0) >= ROLE_WEIGHT['admin']

    if not is_self and not is_admin:
        return {'statusCode': 403, 'headers': cors_headers(), 'body': json.dumps({'error': 'Нет доступа'})}

    body = json.loads(event.get('body') or '{}')
    updates = []
    params = []

    if is_self or is_admin:
        for field in ['bio', 'region', 'standoff_id']:
            key = 'standoffId' if field == 'standoff_id' else field
            if key in body:
                updates.append(f"{field} = %s")
                params.append(body[key])

    if is_admin:
        if 'role' in body:
            if ROLE_WEIGHT.get(body['role'], 0) >= ROLE_WEIGHT.get(caller['role'], 0):
                return {'statusCode': 403, 'headers': cors_headers(), 'body': json.dumps({'error': 'Нельзя назначить равную/выше роль'})}
            updates.append("role = %s")
            params.append(body['role'])
        for field in ['points', 'kills', 'deaths', 'wins', 'losses']:
            if field in body:
                updates.append(f"{field} = %s")
                params.append(body[field])

    if not updates:
        return {'statusCode': 400, 'headers': cors_headers(), 'body': json.dumps({'error': 'Нечего обновлять'})}

    params.append(player_id)
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"UPDATE {SCHEMA}.players SET {', '.join(updates)} WHERE id = %s", params)
    conn.commit()
    conn.close()
    return {'statusCode': 200, 'headers': cors_headers(), 'body': json.dumps({'ok': True})}


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
