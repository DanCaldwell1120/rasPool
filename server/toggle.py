import RPi.GPIO as GPIO
import sys

def toggle(pin, state):
    GPIO.output(pin, state)

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)

pin = int(sys.argv[1])
state = int(sys.argv[2])
GPIO.setup(pin, GPIO.OUT)
toggle(pin, state)
