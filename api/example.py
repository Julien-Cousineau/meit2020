from pymapd import connect
con = connect(user="publicuser", password="password",protocol="https", host="ocremap.ca",port=9092,dbname="meit")

# mapmeit
str1 = "SELECT mapmeit as key0,SUM(nox*1) AS nox FROM t2015a WHERE nox*1 IS NOT NULL GROUP BY key0 ORDER BY nox DESC LIMIT 50"

df = con.select_ipc(str1)
print(df)