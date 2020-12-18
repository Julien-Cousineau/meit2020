import pandas as pd
from pymapd import connect
con = connect(user="publicuser", password="password",protocol="https", host="ec-meit.ca",port="/api",dbname="meit")

# mapmeit
sql = "SELECT mapmeit as key0,SUM(nox*1) AS nox FROM DB_2015 WHERE nox IS NOT NULL GROUP BY key0 ORDER BY nox DESC LIMIT 50"
pd.read_sql(sql,con).to_csv("example.csv",index=False)
