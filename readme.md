To run the program use:

Frontend: npm start
Backend: python app.py
UE: Start a world with webserver running on port 30010


TODO: 
- Add python wrapper to backend for UE API calls
- weather
- time
- settings
- presets
- volume
- view
- favorites

Valid JSON payloads:
When an exposed property has only one variable:
{  "propertyValue": 2000, "generateTransaction": true }

When there are >1 payloads: 
{ "PropertyValue": {"X": 1, "Y": 1.5}, "generateTransaction": true }