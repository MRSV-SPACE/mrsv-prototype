from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

app = Flask(__name__)

# Enable CORS for all routes and origins
CORS(app)

UE_PROPS_BASE_URL = 'http://localhost:30010/remote/preset/MyRemote/property/Time of Day'

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
        print(f"Changing Time of Day to: {value}")
        change_time_of_day = WeatherGetRequest("Time of Day", value)

        response = session.put(UE_PROPS_BASE_URL, json=change_time_of_day)
        print("Status Code:", response.status_code)
        
        return jsonify({"status": "success", "received": value})
    else:
        last_val = value


    

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
