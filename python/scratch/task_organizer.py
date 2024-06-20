import networkx as nx
import json

data = {
  "bread": {
    "steps": {
        "bread-prep": {
          "active": 20,
          "wait": 0,
          "dependencies": []
        },
        "bread-rise": {
          "active": 0,
          "wait": 160,
          "dependencies": ["bread-prep"]
        },
        "bread-preheat-oven": {
          "active": 1,
          "wait": 20,
          "dependencies": ["bread-rise"]
        },
        "bread-batch-1" : {
          "active": 1,
          "wait": 20,
          "dependencies": ["bread-preheat-oven"]
        },
        "bread-batch-2" : {
          "active": 1,
          "wait": 20,
          "dependencies": ["bread-batch-1"]
        },
        "bread-batch-3" : {
          "active": 1,
          "wait": 20,
          "dependencies": ["bread-batch-2"]
        },
        "bread-cleanup-p1": {
          "active": 15,
          "wait": 0,
          "dependencies": ["bread-prep"]
        },
        "bread-cleanup-p2": {
          "active": 15,
          "wait": 0,
          "dependencies": ["bread-batch-3"]
        }
    }
  },
  "lawn": {
      "steps": {
        "lawn-clean-poo": {
          "active": 15,
          "wait": 0,
          "dependencies": []
        },
        "lawn-pull-weeds": {
          "active": 15,
          "wait": 0,
          "dependencies": []
        },
        "lawn-mow": {
          "active": 40,
          "wait": 0,
          "dependencies": ["lawn-clean-poo", "lawn-pull-weeds"]
        },
        "lawn-charge-battery": {
          "active": 1,
          "wait": 45,
          "dependencies": ["lawn-mow"]
        },
        "lawn-weedeat": {
          "active": 20,
          "wait": 0,
          "dependencies": ["lawn-charge-battery"]
        }
      }
  },
  "floors": {
    "steps": {
        "floors-vaccuum": {
          "active": 25,
          "wait": 0,
          "dependencies": []
        },
        "floors-sweep": {
          "active": 15,
          "wait": 0,
          "dependencies": []
        },
        "floors-mop": {
          "active": 25,
          "wait": 0,
          "dependencies": ["floors-sweep"]
        }
      }
  },
  "laundry": {
    "steps": {
      "laundry-prep": {
        "active": 10,
        "wait": 0,
        "dependencies": []
      },
      "laundry-wash-1": {
        "active": 1,
        "wait": 30,
        "dependencies": ["laundry-prep"]
      },
      "laundry-wash-2": {
        "active": 1,
        "wait": 30,
        "dependencies": ["laundry-wash-1"]
      },
      "laundry-wash-3" : {
        "active": 1,
        "wait": 30,
        "dependencies": ["laundry-wash-2"]
      },
      "laundry-dry-1" : {
        "active": 1,
        "wait": 50,
        "dependencies": ["laundry-wash-1"]
      },
      "laundry-dry-2" : {
        "active": 1,
        "wait": 50,
        "dependencies": ["laundry-wash-2", "laundry-dry-1"]
      },
      "laundry-dry-3" : {
        "active": 1,
        "wait": 50,
        "dependencies": ["laundry-wash-3", "laundry-dry-2"]
      },
      "laundry-putaway": {
        "active": 20,
        "wait": 0,
        "dependencies": ["laundry-dry-3"]
      }
    }
  }
}

# Create a directed graph
G = nx.DiGraph()

# Add nodes and edges to the graph
for task, steps in data.items():
    for step, details in steps['steps'].items():
        G.add_node(step)
        for dependency in details['dependencies']:
            G.add_edge(dependency, step)

# Perform a topological sorting
sorted_tasks = list(nx.topological_sort(G))

# Initialize the current time
current_time = 0

# Print the sorted tasks with their start times
for task in sorted_tasks:
    print(f"{current_time//60}:{current_time%60} - {task}")
    current_time += data[task.split('-')[0]]['steps'][task]['active'] + data[task.split('-')[0]]['steps'][task]['wait']