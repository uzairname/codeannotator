import os
import re
import sys

dependencyGraph = {}

# Get the directory from the command line
print("args: ", sys.argv)
directory = sys.argv[1]

for root, dirs, files in os.walk(directory):
    for filename in files:
        f = os.path.join(root, filename)
        dependencyGraph[f] = []


# Build Graph
for key, lis in dependencyGraph.items():
    with open(key, 'r') as curFile:
        lines = curFile.readlines()
        for line in lines:
            match = re.match(r'^\s*from\s+(\S+)\s+import\s+\S+', line)
            if match:
                imported_module = match.group(1)
                dependencyGraph[key].append(imported_module)
            else:
                match = re.match(r'^\s*import\s+(\S+)', line)
                if match:
                    imported_module = match.group(1)
                    dependencyGraph[key].append(imported_module)


print(dependencyGraph)


if __name__ == "__main__":

    print(sys.argv[1])