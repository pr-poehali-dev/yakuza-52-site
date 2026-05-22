import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p6853430_yakuza_52_site')

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization',
    }

def get_caller(event: dict):
    token = _extract_token(event)
    if not token:
        return None
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"SELECT p.id, p.nickname, p.role FROM {SCHEMA}.sessions s JOIN {SCHEMA}.players p ON p.id = s.player_id WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    conn.close()
    return {'id': row[0], 'nickname': row[1], 'role': row[2]} if row else None

def handler(event: dict, context) -> dict:
    """Чат: список комнат, сообщения, отправка"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    parts = [p for p in path.strip('/').split('/') if p]

    if method == 'GET' and (not parts or (len(parts) == 1 and not parts[0].isdigit())):
        return list_rooms()

    if parts and parts[-1].isdigit():
        room_id = int(parts[-1])
        if method == 'GET':
            return get_messages(room_id, event)
        if method == 'POST':
            return send_message(event, room_id)

    return {'statusCode': 404, 'headers': cors_headers(), 'body': json.dumps({'error': 'Not found'})}


def list_rooms() -> dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"SELECT id, name, type FROM {SCHEMA}.chat_rooms ORDER BY id")
    rows = cur.fetchall()
    conn.close()
    rooms = [{'id': r[0], 'name': r[1], 'type': r[2]} for r in rows]
    return {'statusCode': 200, 'headers': cors_headers(), 'body': json.dumps({'rooms': rooms})}


def get_messages(room_id: int, event: dict) -> dict:
    caller = get_caller(event)
    if not caller:
        return {'statusCode': 401, 'headers': cors_headers(), 'body': json.dumps({'error': 'Не авторизован'})}

    params = event.get('queryStringParameters') or {}
    limit = min(int(params.get('limit', 50)), 100)
    offset = int(params.get('offset', 0))

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"""SELECT m.id, m.player_id, p.nickname, m.content, m.created_at
            FROM {SCHEMA}.messages m
            JOIN {SCHEMA}.players p ON p.id = m.player_id
            WHERE m.chat_room_id = %s
            ORDER BY m.created_at DESC
            LIMIT %s OFFSET %s""",
        (room_id, limit, offset)
    )
    rows = cur.fetchall()
    conn.close()
    messages = [
        {
            'id': r[0], 'senderId': r[1], 'senderNick': r[2],
            'content': r[3], 'timestamp': r[4].isoformat(),
            'chatId': str(room_id),
        }
        for r in reversed(rows)
    ]
    return {'statusCode': 200, 'headers': cors_headers(), 'body': json.dumps({'messages': messages})}


def send_message(event: dict, room_id: int) -> dict:
    caller = get_caller(event)
    if not caller:
        return {'statusCode': 401, 'headers': cors_headers(), 'body': json.dumps({'error': 'Не авторизован'})}

    body = json.loads(event.get('body') or '{}')
    content = body.get('content', '').strip()
    if not content:
        return {'statusCode': 400, 'headers': cors_headers(), 'body': json.dumps({'error': 'Сообщение пустое'})}
    if len(content) > 2000:
        return {'statusCode': 400, 'headers': cors_headers(), 'body': json.dumps({'error': 'Сообщение слишком длинное'})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"INSERT INTO {SCHEMA}.messages (chat_room_id, player_id, content) VALUES (%s, %s, %s) RETURNING id, created_at",
        (room_id, caller['id'], content)
    )
    row = cur.fetchone()
    conn.commit()
    conn.close()

    return {'statusCode': 201, 'headers': cors_headers(), 'body': json.dumps({
        'message': {
            'id': row[0], 'senderId': caller['id'], 'senderNick': caller['nickname'],
            'content': content, 'timestamp': row[1].isoformat(), 'chatId': str(room_id),
        }
    })}


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
