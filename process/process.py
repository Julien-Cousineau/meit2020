import os
import sys
import pandas as pd
import numpy as np



def process(name):
    filePath = f"data/csv/{name}.csv"
    outPath  = f"data/csv/{name}.2.csv"
    df=pd.read_csv(filePath,encoding='latin1')
    print(df.columns)
    # df = df.groupby(['Courses']).sum().reset_index()
    # df.to_csv(outPath,index=False)

if __name__ == "__main__":
   process("MEIT_Arctic_Data_2022-11-07/No_Scrubber_2015_arctic_emissions_2022-11-04")
   