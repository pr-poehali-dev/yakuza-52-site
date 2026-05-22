import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p6853430_yakuza_52_site')

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization',
    }

def handler(event: dict, context) -> dict:
    """Аутентификация: вход, выход, проверка токена"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')

    if method == 'POST' and path.endswith('/login'):
        return login(event)
    if method == 'POST' and path.endswith('/logout'):
        return logout(event)
    if method == 'GET' and path.endswith('/me'):
        return get_me(event)

    return {'statusCode': 404, 'headers': cors_headers(), 'body': json.dumps({'error': 'Not found'})}


def login(event: dict) -> dict:
    body = json.loads(event.get('body') or '{}')
    login_val = body.get('login', '').strip()
    password = body.get('password', '').strip()

    if not login_val or not password:
        return {'statusCode': 400, 'headers': cors_headers(), 'body': json.dumps({'error': 'Укажи логин и пароль'})}

    pw_hash = hash_password(password)

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, nickname, role, standoff_id, points, kills, deaths, wins, losses, bio, region, joined_at FROM {SCHEMA}.players WHERE login = %s AND password_hash = %s",
        (login_val, pw_hash)
    )
    row = cur.fetchone()

    if not row:
        conn.close()
        return {'statusCode': 401, 'headers': cors_headers(), 'body': json.dumps({'error': 'Неверный логин или пароль'})}

    player = {
        'id': row[0], 'nickname': row[1], 'role': row[2], 'standoffId': row[3],
        'points': row[4], 'kills': row[5], 'deaths': row[6], 'wins': row[7],
        'losses': row[8], 'bio': row[9], 'region': row[10],
        'joinedAt': str(row[11]) if row[11] else None,
    }

    token = secrets.token_hex(32)
    expires = datetime.now(timezone.utc) + timedelta(days=30)

    cur.execute(
        f"INSERT INTO {SCHEMA}.sessions (player_id, token, expires_at) VALUES (%s, %s, %s)",
        (player['id'], token, expires)
    )
    cur.execute(
        f"UPDATE {SCHEMA}.players SET is_online = TRUE WHERE id = %s",
        (player['id'],)
    )
    conn.commit()
    conn.close()

    resp_body = json.dumps({'token': token, 'player': player})
    return {
        'statusCode': 200,
        'headers': {**cors_headers(), 'X-Set-Cookie': f'clan_token={token}; Path=/; Max-Age=2592000; SameSite=Lax'},
        'body': resp_body,
    }


def logout(event: dict) -> dict:
    token = _extract_token(event)
    if token:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT player_id FROM {SCHEMA}.sessions WHERE token = %s", (token,))
        row = cur.fetchone()
        if row:
            cur.execute(f"UPDATE {SCHEMA}.players SET is_online = FALSE WHERE id = %s", (row[0],))
        cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at = NOW() WHERE token = %s", (token,))
        conn.commit()
        conn.close()
    return {
        'statusCode': 200,
        'headers': {**cors_headers(), 'X-Set-Cookie': 'clan_token=; Path=/; Max-Age=0'},
        'body': json.dumps({'ok': True}),
    }


def get_me(event: dict) -> dict:
    token = _extract_token(event)
    if not token:
        return {'statusCode': 401, 'headers': cors_headers(), 'body': json.dumps({'error': 'Не авторизован'})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"""SELECT p.id, p.nickname, p.role, p.standoff_id, p.points, p.kills, p.deaths,
               p.wins, p.losses, p.bio, p.region, p.joined_at, p.is_online
            FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.players p ON p.id = s.player_id
            WHERE s.token = %s AND s.expires_at > NOW()""",
        (token,)
    )
    row = cur.fetchone()
    conn.close()

    if not row:
        return {'statusCode': 401, 'headers': cors_headers(), 'body': json.dumps({'error': 'Сессия истекла'})}

    player = {
        'id': row[0], 'nickname': row[1], 'role': row[2], 'standoffId': row[3],
        'points': row[4], 'kills': row[5], 'deaths': row[6], 'wins': row[7],
        'losses': row[8], 'bio': row[9], 'region': row[10],
        'joinedAt': str(row[11]) if row[11] else None,
        'isOnline': row[12],
    }
    return {'statusCode': 200, 'headers': cors_headers(), 'body': json.dumps({'player': player})}


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
