from connections import connect_mqtt, connect_internet
from machine import PWM, Pin, I2C, ADC, time_pulse_us
import dht
import time
import ssd1306
i2c = I2C(0, scl=Pin(1), sda=Pin(0), freq=400000)
oled = ssd1306.SSD1306_I2C(128, 64, i2c)

# --- Constants ---
SOUND_SPEED = 340  # m/s
TRIG_PULSE_DURATION_US = 5
MAX_DURATION_TIMEOUT = 60000

# --- Pin Setup ---
trig_pin = Pin(15, Pin.OUT)
echo_pin = Pin(14, Pin.IN)
photoresistor = ADC(Pin(26))        # GP26 (ADC0)
temphum = dht.DHT11(Pin(13))        # DHT11 on GP13
servo = PWM(Pin(16))  # GP16 controls the servo
servo.freq(50)        # Standard servo frequency

def display_message(text):

    oled.fill(0)
    oled.text("Message:", 0, 0)

    max_chars = 16
    lines = [text[i:i+max_chars] for i in range(0, len(text), max_chars)]
    for i, line in enumerate(lines[:6]):
        oled.text(line, 0, (i + 1) * 10)
    oled.show()
    time.sleep(5)

def read_sensors():
    # --- Ultrasonic ---
    trig_pin.value(0)
    time.sleep_us(2)
    trig_pin.value(1)
    time.sleep_us(TRIG_PULSE_DURATION_US)
    trig_pin.value(0)

    duration = time_pulse_us(echo_pin, 1, MAX_DURATION_TIMEOUT)
    distance_cm = SOUND_SPEED * duration / 20000 if duration > 0 else None

    # --- Photoresistor ---
    raw = photoresistor.read_u16()
    voltage = raw * 3.3 / 65535
    lumens = voltage * -0.38 + 1.0204

    # --- DHT11 Temp & Humidity ---
    try:
        temphum.measure()
        temp_f = temphum.temperature() * 9 / 5 + 32 - 6
        humidity = temphum.humidity()
    except Exception as e:
        temp_f = None
        humidity = None

    return {
        "distance": distance_cm,
        "light": lumens,
        "temperature": temp_f,
        "humidity": humidity
    }
def on_message(topic, msg):
    text = msg.decode()
    print(f"[MQTT] {topic.decode()}: {text}")

    if topic.decode() == "servo/sweep":
        print("➡️ Running servo sweep!")
        sweep_servo()
    
    if topic.decode() == "device/input":
        display_message(text)
def display_data(data):
    i2c = I2C(0, scl=Pin(1), sda=Pin(0), freq=400000)
    oled = ssd1306.SSD1306_I2C(128, 64, i2c)

    oled.fill(0)
    oled.text("Temp: {:.1f}F".format(data["temperature"]) if data["temperature"] is not None else "Temp: N/A", 0, 0)
    oled.text("Humidity: {}%".format(data["humidity"]) if data["humidity"] is not None else "Humidity: N/A", 0, 10)
    oled.text("Distance: {:.1f}cm".format(data["distance"]) if data["distance"] is not None else "Distance: N/A", 0, 20)
    oled.text("Light: {:.2f}".format(data["light"]), 0, 30)
    oled.show()
def set_angle(angle):
    # Clamp angle to range -120 to 120
    angle = max(-120, min(120, angle))
    # Shift -120–120 → 0–240, then map to 1000–9000
    shifted = angle + 120
    duty = int(1000 + (shifted / 240) * 8000)
    servo.duty_u16(duty)

def sweep_servo():
    # From 0 to -120
    for angle in range(0, -121, -5):
        set_angle(angle)
        time.sleep(0.04)

    # From -120 to +120
    for angle in range(-120, 121, 5):
        set_angle(angle)
        time.sleep(0.04)

    # From +120 back to 0
    for angle in range(120, -1, -5):
        set_angle(angle)
        time.sleep(0.04)

def main():
    try:
        connect_internet("home24", password="helpfulmango482abc0123")
        client = connect_mqtt("89819e1e9cdd4652913ec1014279bd93.s1.eu.hivemq.cloud", "anguyen1713", "Hack2025Team6")

        client.set_callback(on_message)
        client.subscribe(b"device/input")
        print("Subscribed to device/input")
        
        client.subscribe(b"servo/sweep")
        print("Subscribed to servo/sweep")



        while True:
            client.check_msg() 
            data = read_sensors()

            if data["temperature"] is not None:
                client.publish("temp", str(data["temperature"]))
            if data["humidity"] is not None:
                client.publish("humidity", str(data["humidity"]))
            if data["distance"] is not None:
                client.publish("ultrasonic", str(data["distance"]))
            client.publish("light", str(data["light"]))

            print("Published:", data)
            time.sleep(1)
            
            display_data(data)
    except KeyboardInterrupt:
        print("Interrupted")

if __name__ == "__main__":
    main()
