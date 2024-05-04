type UpsData = {
 "SrNo": "String",
    "upsId": "Int",
    "inVolt": "Float",
    "inFaultVolt": "Float",
    "outVolt": "Float",
    "outCurrent": "Float",
    "inFreq": "Float",
    "battVolt": "Float",
    "tempC": "Float",
    "Beeper": "Int",
    "shutdown": "Int",
    "upsStat": "Int",
    "avrStat": "Int",
    "batteryStat": "Int",
    "acStat": "Int"
};

type UpsDataArray = UpsData[];

export { UpsDataArray };
