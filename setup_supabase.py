#!/usr/bin/env python3
"""
Script para executar o schema SQL no Supabase
"""
import requests
import json

# Credenciais do Supabase
SUPABASE_URL = 'https://vaylmepocuppvfkixeoj.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZheWxtZXBvY3VwcHZma2l4ZW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzYxNzgsImV4cCI6MjA3NzI1MjE3OH0.6rnAnhN_cEacUdb6RAvQiyiFI3-_ZVmh84QRueQT3HU'

# Ler o arquivo SQL
with open('supabase_analytics_schema.sql', 'r', encoding='utf-8') as f:
    sql_script = f.read()

# Endpoint da API REST do Supabase para executar SQL
# Nota: A API REST padrão não permite executar SQL arbitrário por segurança
# Precisamos usar o PostgREST RPC ou a Management API

print("=" * 80)
print("SCRIPT SQL PARA EXECUTAR NO SUPABASE")
print("=" * 80)
print("\nPor questões de segurança, a API REST do Supabase não permite")
print("executar SQL arbitrário via código.")
print("\nPor favor, execute o SQL manualmente seguindo estes passos:")
print("\n1. Acesse: https://supabase.com/dashboard/project/vaylmepocuppvfkixeoj")
print("2. Vá em 'SQL Editor' no menu lateral")
print("3. Clique em 'New Query'")
print("4. Cole o conteúdo do arquivo: supabase_analytics_schema.sql")
print("5. Clique em 'Run' para executar")
print("\nOu copie o SQL abaixo:")
print("=" * 80)
print(sql_script)
print("=" * 80)

# Verificar se as tabelas já existem
print("\n\nVerificando tabelas existentes...")
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

# Tentar consultar as tabelas
tables_to_check = ['analytics_stats', 'analytics_events', 'user_consents', 'waitlist']

for table in tables_to_check:
    try:
        response = requests.get(
            f'{SUPABASE_URL}/rest/v1/{table}?limit=1',
            headers=headers
        )
        if response.status_code == 200:
            print(f"✓ Tabela '{table}' existe")
        elif response.status_code == 404:
            print(f"✗ Tabela '{table}' NÃO existe")
        else:
            print(f"? Tabela '{table}' - Status: {response.status_code}")
    except Exception as e:
        print(f"✗ Erro ao verificar tabela '{table}': {e}")

print("\n" + "=" * 80)
