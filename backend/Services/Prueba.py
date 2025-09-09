import pandas as pd
from sqlalchemy import create_engine
import math

# ------------------------------
# Conexión a SQL Server
# ------------------------------
server = 'DESKTOP-RCPI344'
database = 'DW_Energia'
driver = 'ODBC Driver 17 for SQL Server'

# Crear URL de conexión SQLAlchemy
conn_str = f"mssql+pyodbc://@{server}/{database}?driver={driver.replace(' ', '+')}&trusted_connection=yes"
engine = create_engine(conn_str)

print("✅ Conexión establecida")

# ------------------------------
# Leer CSVs
# ------------------------------
print("📂 Leyendo archivos CSV...")
df_consumo = pd.read_csv(r"C:\Users\User\Downloads\dataset.csv", parse_dates=["Date Time"])
df_utility = pd.read_csv(r"C:\Users\User\Downloads\api.csv")
print(f"📊 Dataset consumo: {len(df_consumo)} registros")
print(f"📊 Dataset utility: {len(df_utility)} registros")

# ------------------------------
# Crear Dim_Tiempo
# ------------------------------
print("🕐 Procesando dimensión tiempo...")
df_tiempo = df_consumo[['Date Time']].drop_duplicates().copy()
df_tiempo['anio'] = df_tiempo['Date Time'].dt.year
df_tiempo['mes'] = df_tiempo['Date Time'].dt.month
df_tiempo['dia'] = df_tiempo['Date Time'].dt.day
df_tiempo['hora'] = df_tiempo['Date Time'].dt.hour
df_tiempo['minuto'] = df_tiempo['Date Time'].dt.minute
df_tiempo['dia_semana'] = df_tiempo['Date Time'].dt.day_name()
df_tiempo.reset_index(drop=True, inplace=True)
df_tiempo['id_tiempo'] = df_tiempo.index + 1

# Renombrar y reordenar columnas
df_tiempo = df_tiempo.rename(columns={'Date Time': 'fecha'})
df_tiempo = df_tiempo[['id_tiempo', 'fecha', 'anio', 'mes', 'dia', 'hora', 'minuto', 'dia_semana']]

# ------------------------------
# Crear Dim_Utility
# ------------------------------
print("🏢 Procesando dimensión utility...")
df_utility.reset_index(drop=True, inplace=True)
df_utility['id_utility'] = df_utility.index + 1

# Mapear columnas reales del CSV o crear por defecto
for col in ['name', 'sector', 'country', 'description', 'source']:
    if col not in df_utility.columns:
        if col == 'name':
            df_utility[col] = 'Utility_' + df_utility['id_utility'].astype(str)
        elif col == 'sector':
            df_utility[col] = 'Energy'
        elif col == 'country':
            df_utility[col] = 'USA'
        elif col == 'description':
            df_utility[col] = 'Energy utility company'
        elif col == 'source':
            df_utility[col] = 'API Data'

# Limpiar valores nulos
df_utility = df_utility.fillna({
    'name': 'Unknown Utility',
    'sector': 'Energy', 
    'country': 'USA',
    'description': 'Not Specified',
    'source': 'Not Specified'
})

# Convertir todo a string para evitar problemas
for col in ['name', 'sector', 'country', 'description', 'source']:
    df_utility[col] = df_utility[col].astype(str)

df_utility = df_utility[['id_utility', 'name', 'sector', 'country', 'description', 'source']]

# ------------------------------
# Crear Fact_ConsumoEnergia
# ------------------------------
print("📈 Procesando tabla de hechos...")
df_fact = df_consumo.merge(df_tiempo[['fecha', 'id_tiempo']], 
                          left_on='Date Time', right_on='fecha', how='left')
df_fact['id_utility'] = 1

# Renombrar columnas para coincidir con SQL
df_fact = df_fact[['id_tiempo', 'id_utility', 'Global_active_power', 'Global_reactive_power', 
                   'Global_intensity', 'Voltage', 'Sub_metering_1', 'Sub_metering_2', 'Sub_metering_3']]

df_fact = df_fact.rename(columns={
    'Global_active_power': 'global_active_power',
    'Global_reactive_power': 'global_reactive_power', 
    'Global_intensity': 'global_intensity',
    'Voltage': 'voltage',
    'Sub_metering_1': 'sub_metering_1',
    'Sub_metering_2': 'sub_metering_2',
    'Sub_metering_3': 'sub_metering_3'
})

# Limpiar valores nulos
df_fact = df_fact.dropna()

# ------------------------------
# Función para inserción por lotes
# ------------------------------
def insert_chunks(dataframe, table_name, engine, chunk_size=1000):
    total_rows = len(dataframe)
    chunks = math.ceil(total_rows / chunk_size)
    
    print(f"📊 Insertando {total_rows} registros en {chunks} lotes de {chunk_size}...")
    
    for i in range(chunks):
        start_idx = i * chunk_size
        end_idx = min((i + 1) * chunk_size, total_rows)
        chunk_df = dataframe.iloc[start_idx:end_idx]
        
        try:
            chunk_df.to_sql(table_name, engine, if_exists='append', index=False)
            print(f"✅ Lote {i+1}/{chunks} insertado ({len(chunk_df)} registros)")
        except Exception as e:
            print(f"❌ Error en lote {i+1}: {e}")
            return False
    
    return True

# ------------------------------
# Insertar datos
# ------------------------------
print("\n🚀 Iniciando carga de datos...")

try:
    # Insertar en orden: Utility, Tiempo, Hechos
    success = insert_chunks(df_utility, 'Dim_Utility', engine, 50)
    
    if success:
        success = insert_chunks(df_tiempo, 'Dim_Tiempo', engine, 5000)
    
    if success:
        success = insert_chunks(df_fact, 'Fact_ConsumoEnergia', engine, 1000)
    
    if success:
        print("\n✅ ¡PROCESO COMPLETADO EXITOSAMENTE!")
        print(f"📈 Resumen:")
        print(f"   - Dim_Utility: {len(df_utility)} registros")
        print(f"   - Dim_Tiempo: {len(df_tiempo)} registros") 
        print(f"   - Fact_ConsumoEnergia: {len(df_fact)} registros")

except Exception as e:
    print(f"❌ Error: {e}")

finally:
    engine.dispose()
    print("🔒 Conexión cerrada")