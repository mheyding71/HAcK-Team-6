from connections import connect_mqtt, connect_internet
from time import sleep


def main():
    try:
        connect_internet("HAcK-Project-WiFi-1",password="UCLA.HAcK.2024.Summer") #ssid (wifi name), pass
        client = connect_mqtt("89819e1e9cdd4652913ec1014279bd93.s1.eu.hivemq.cloud", "anguyen1713", "") # url, user, pass

        while True:
            client.check_msg()
            sleep(0.1)

    except KeyboardInterrupt:
        print('keyboard interrupt')
        
        
if __name__ == "__main__":
    main()



