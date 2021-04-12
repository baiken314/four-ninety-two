#map format should be 1000x1000 pixels, mapped entirely on a 5-pixel grid using 90 and 45 degree angles

SVGname = input("Enter SVG file name to parse (no file extension): ")

with open(SVGname + ".svg", 'r') as SVG:
    SVGtext = SVG.read().replace('\n', '')

newFileName = SVGname + ".json"

JSON = open(newFileName, 'w')

JSON.write("{\n")
JSON.write("\t\"name\": \"\",\n")
JSON.write("\t\"description\": \"\",\n")
JSON.write("\t\"startingRegions\": [\n")
JSON.write("\t\t{\n")
JSON.write("\t\t\t\"name\": \"\",\n")
JSON.write("\t\t\t\"regionNames\": []\n")
JSON.write("\t\t},\n")
JSON.write("\t\t{\n")
JSON.write("\t\t\t\"name\": \"\",\n")
JSON.write("\t\t\t\"regionNames\": []\n")
JSON.write("\t\t}\n")
JSON.write("\t],\n")
JSON.write("\t\"regions\": [\n")

splitSVGtext = SVGtext.split("polygon id=")
for i, line in enumerate(splitSVGtext[1:]):
    if i:
        JSON.write(",\n")
    splitLine = (line.split('"'))
    regionName = splitLine[1].replace("_"," ")
    JSON.write("\t\t{\n")
    JSON.write("\t\t\t\"name\": \"" + regionName + "\",\n")
    JSON.write("\t\t\t\"type\": \"\",\n")
    JSON.write("\t\t\t\"adjacentRegionNames\": [],\n")
    JSON.write("\t\t\t\"industrialization\": {\n")
    JSON.write("\t\t\t\t\"agriculture\": 0,\n")
    JSON.write("\t\t\t\t\"mining\": 0,\n")
    JSON.write("\t\t\t\t\"synthetics\": 0\n")
    JSON.write("\t\t\t},\n")
    JSON.write("\t\t\t\"coordinates\": [\n")
    coordinatesList = splitLine[5].split()
    for j, coordinates in enumerate(coordinatesList):
        if j:
            JSON.write(",\n")
        setOfCoordinates = coordinates.split(",")
        JSON.write("\t\t\t\t{\n")
        JSON.write("\t\t\t\t\t\"x\": " + setOfCoordinates[0] + ",\n")
        JSON.write("\t\t\t\t\t\"y\": " + setOfCoordinates[1] + "\n")
        JSON.write("\t\t\t\t}")
    JSON.write("\n\t\t\t]\n")
    JSON.write("\t\t}")

JSON.write("\n\t]\n")
JSON.write("}")

JSON.close()