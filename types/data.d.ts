type UpsData = {
 "serialNumber": "String",
    "upsId": "Int",
    "inputVoltage": "Float",
    "inputFaultVoltage": "Float",
    "outputVoltage": "Float",
    "outputCurrent": "Float",
    "inputFrequency": "Float",
    "batteryVoltage": "Float",
    "temperature": "Float",
    "beeper": "Int",
    "shutdown": "Int",
    "upsStat": "Int",
    "avgStat": "Int",
    "batteryStat": "Int",
    "acStat": "Int"
};

type UpsDataArray = UpsData[];

export { UpsDataArray };
