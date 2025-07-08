from flask import Flask, jsonify, request
from flask_cors import CORS
from upyrc import upyrc
import logging
import requests

app = Flask(__name__)
CORS(app)

UE_PROPS_BASE_URL = 'http://localhost:30010/remote/preset/MyRemote/property/Time of Day'

print(upyrc.__file__)

#import logging
upyrc.set_log_level(logging.DEBUG)
print("Version:", upyrc.get_version())

# Create a connection to Unreal
conn = upyrc.URConnection()
print("Ping: ", conn.ping())
# >>> Ping: 127.0.0.1:30010

# Get all presets basic infos ( Name, ID and path )
all_presets = conn.get_all_presets()
print("Presets: ", all_presets)

# Get an preset object, by name.
preset_name = "MyRemote"
preset = conn.get_preset(preset_name)
print("Preset: ", preset)

print(preset.get_all_property_names())

def WeatherGetRequest(name, value):
    return { "propertyValue": value,
            "generateTransaction": True }  

last_val = 0
session = requests.Session()

@app.route('/api/update-time', methods=['POST'])
def update_value():
    global last_val
    global session

    data = request.get_json()
    value = float(data.get('hours') * 100 + data.get('minutes'))
    print(value)

    if value != last_val:
        # Get a preset exposed property:
        preset_property = preset.get_property("Time Of Day")
        print("Previous Time of Day: ", preset_property.eval())

        # set new value using that exposed prop
        preset_property.set(Time_of_Day=value)
        print("New Time of Day: ", preset_property.eval())
        
        return jsonify({"status": "success", "received": value})
    else:
        last_val = value


    

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
