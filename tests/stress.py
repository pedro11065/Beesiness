from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()

for i in range(0,100):
    driver.get("http://192.168.1.12:5000")

driver.close()