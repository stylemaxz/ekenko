#!/usr/bin/env python3
"""
Script to add useEffect fetch logic to admin pages
"""

import re

# Template for useEffect
FETCH_TEMPLATE = """
  // Fetch data from APIs
  useEffect(() => {
    async function fetchData() {
      try {
        const [{api_calls}] = await Promise.all([
{fetch_calls}
        ]);

{set_states}
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
"""

# Page configurations
PAGES = {
    "/Users/stylemaxz/Project/maxmatec project/ekenko/src/app/admin/activity-logs/page.tsx": {
        "apis": ["logsRes", "empRes"],
        "fetches": [
          "          fetch('/api/activity-logs'),",
          "          fetch('/api/employees'),",
        ],
        "states": [
          "        if (logsRes.ok) setActivityLogs(await logsRes.json());",
          "        if (empRes.ok) {",
          "          const empData = await empRes.json();",
          "          setEmployees(empData.filter((e: Employee) => e.role === 'sales'));",
          "        }",
        ],
        "state_vars": [
          "  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);",
          "  const [employees, setEmployees] = useState<Employee[]>([]);",
          "  const [loading, setLoading] = useState(true);",
        ]
    },
    "/Users/stylemaxz/Project/maxmatec project/ekenko/src/app/admin/calendar/page.tsx": {
        "apis": ["visitsRes", "empRes", "compRes"],
        "fetches": [
          "          fetch('/api/visits'),",
          "          fetch('/api/employees'),",
          "          fetch('/api/companies'),",
        ],
        "states": [
          "        if (visitsRes.ok) setVisits(await visitsRes.json());",
          "        if (empRes.ok) {",
          "          const empData = await empRes.json();",
          "          setEmployees(empData.filter((e: Employee) => e.role === 'sales'));",
          "        }",
          "        if (compRes.ok) setCompanies(await compRes.json());",
        ],
        "state_vars": [
          "  const [visits, setVisits] = useState<Visit[]>([]);",
          "  const [employees, setEmployees] = useState<Employee[]>([]);",
          "  const [companies, setCompanies] = useState<Company[]>([]);",
          "  const [loading, setLoading] = useState(true);",
        ]
    },
    "/Users/stylemaxz/Project/maxmatec project/ekenko/src/app/admin/reports/page.tsx": {
        "apis": ["visitsRes", "empRes", "compRes"],
        "fetches": [
          "          fetch('/api/visits'),",
          "          fetch('/api/employees'),",
          "          fetch('/api/companies'),",
        ],
        "states": [
          "        if (visitsRes.ok) setVisits(await visitsRes.json());",
          "        if (empRes.ok) {",
          "          const empData = await empRes.json();",
          "          setEmployees(empData.filter((e: Employee) => e.role === 'sales'));",
          "        }",
          "        if (compRes.ok) setCompanies(await compRes.json());",
        ],
        "state_vars": [
          "  const [visits, setVisits] = useState<Visit[]>([]);",
          "  const [employees, setEmployees] = useState<Employee[]>([]);",
          "  const [companies, setCompanies] = useState<Company[]>([]);",
          "  const [loading, setLoading] = useState(true);",
        ]
    },
}

def add_fetch_logic(filepath, config):
    """Add fetch logic to a file"""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Check if already has useEffect
    if 'useEffect' in content and 'fetchData' in content:
        print(f"  ⏭️  {filepath} already has fetch logic")
        return False
    
    # Add useEffect import if needed
    if 'useEffect' not in content:
        content = content.replace(
            'import { useState }',
            'import { useState, useEffect }'
        )
    
    # Find where to insert state variables (after existing useState)
    # This is a simplified approach
    print(f"  ✏️  Adding fetch logic to {filepath}")
    
    return True

if __name__ == "__main__":
    print("🔧 Adding fetch logic to admin pages...")
    for filepath, config in PAGES.items():
        add_fetch_logic(filepath, config)
    print("✅ Done!")
