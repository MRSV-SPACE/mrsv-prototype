from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
import sys

# ---------------- Import Wrapper via local storage ---------------
sys.path.insert(0, r"backend\backend\UnrealRemoteControlWrapper\UnrealRemoteControlWrapper-main\src")
from upyrc import upyrc
# -----------------------------------------------------------------

app = Flask(__name__)
CORS(app)

# --------------- Manual HTTP Requests (old method) ------------------------
#UE_PROPS_BASE_URL = 'http://localhost:30010/remote/preset/MyRemote/property/Time of Day'

#def WeatherGetRequest(name, value):
#    return { "propertyValue": value,
#            "generateTransaction": True }  
# -----------------------------------------------------------------------------

print(upyrc.__file__)

#import logging -- Logging levels: FATAL, ERROR, WARN, INFO, DEBUG, TRACE
upyrc.set_log_level(logging.DEBUG)
print("Version:", upyrc.get_version())

# Create a connection to Unreal --> host='192.168.0.20' if connecting to rig
conn = upyrc.URConnection()
print("Ping: ", conn.ping())
# >>> Ping: 127.0.0.1:30010

# Get an preset object, by name.
preset_name = "MyRemote"
preset = conn.get_preset(preset_name)

@app.route('/api/get_all_presets', methods=['GET', 'POST'])
def get_all_presets():
    # Get all presets basic infos ( Name, ID and path )
    all_presets = conn.get_all_presets()
    print("Presets: ", all_presets)
    return all_presets


@app.route('/api/get_all_presets_data', methods=['GET', 'POST'])
def get_all_presets_data():
    # Get all presets basic infos ( Name, ID and path )
    all_preset_data = preset.get_all_property_names()
    print("All preset vars: ", all_preset_data)
    return all_preset_data

last_val = 0

@app.route('/api/update-time', methods=['POST'])
def update_value():
    global last_val

    data = request.get_json()
    value = float(data.get('hours') * 100 + data.get('minutes'))
    print(value)

    if value != last_val:
        # Get a preset exposed property:
        preset_property = preset.get_property("Time Of Day")
        print("Previous Time of Day: ", preset_property.eval())

        # set new value using that exposed prop
        preset_property.single_set(value) # not sure if this will work
        print("New Time of Day: ", preset_property.eval())
        
        return jsonify({"status": "success", "received": value})
    else:
        last_val = value


@app.route('/api/move-camera', methods=['POST'])
def move_camera():
    data = request.get_json()
    print("Moving Camera: ", data)
    #preset_property = preset.get_property("Camera Direction")
    #preset_property.set(left=data.get('left'), right=data.get('right'), up=data.get('up'), down=data.get('down'), speed=data.get('speed'))
    return jsonify({"status": "success", "received": data})


def format_camera_json(left, right, up, down):
    return {
	"PropertyValue": {
		"left_24_5BF42979487CDCBA06A3128D28A3371F": left,
		"down_31_51B309DD4649DFEE711A69A401E89113": down,
		"right_25_49D8AE81486F02C938E04D9B954B4417": right,
		"up_27_2E7037734304D6E5EA388BA424D43419": up,
		"speed_32_57CF765E4033B21BD6E484A6CFC8879F": 45
	},
	"GenerateTransaction": True
}


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
