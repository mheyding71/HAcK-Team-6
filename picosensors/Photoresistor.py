from machine import Pin, ADC
import dht
import time

photoresistor = ADC(Pin(26))
temphum = dht.DHT11(Pin(15)) 

while True:
    # lumens = photoresistor.read_u16() * 3.3 / 65535
    # time.sleep(1)

    # lumens = lumens * -0.38 +  1.0204
    # print(lumens)

    temphum.measure()
    temperature = temphum.temperature()
    humidity = temphum.humidity()
    print(f"Temperature: {temperature}°C, Humidity: {humidity}%")
