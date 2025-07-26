from machine import Pin, ADC, time_pulse_us
import dht
import time

# --- Constants ---
SOUND_SPEED = 340  # m/s
TRIG_PULSE_DURATION_US = 5
MAX_DURATION_TIMEOUT = 60000

# --- Pin Setup ---
trig_pin = Pin(15, Pin.OUT)
echo_pin = Pin(14, Pin.IN)
photoresistor = ADC(Pin(26))        # GP26 (ADC0)
temphum = dht.DHT11(Pin(13))        # DHT11 on GP13

while True:
    # --- Ultrasonic ---
    trig_pin.value(0)
    time.sleep_us(2)
    trig_pin.value(1)
    time.sleep_us(TRIG_PULSE_DURATION_US)
    trig_pin.value(0)

    duration = time_pulse_us(echo_pin, 1, MAX_DURATION_TIMEOUT)
    if duration <= 0:
        print("Distance: Out of range or no echo")
    else:
        distance_cm = SOUND_SPEED * duration / 20000
        print(f"Distance: {distance_cm:.2f} cm")

    # --- Photoresistor ---
    raw = photoresistor.read_u16()
    voltage = raw * 3.3 / 65535
    lumens = voltage * -0.38 + 1.0204
    print(f"Light Level (lumens est.): {lumens:.2f}")

    # --- DHT11 Temp & Humidity ---
    try:
        temphum.measure()
        temperature = temphum.temperature()
        humidity = temphum.humidity()
        print(f"Temperature: {temperature*9/5+32-6}°F, Humidity: {humidity+18}%")
    except Exception as e:
        print("DHT11 error:", e)

    print("-" * 35)
    time.sleep(1)
