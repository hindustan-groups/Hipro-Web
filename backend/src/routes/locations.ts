import { Router, Request, Response } from "express";

const router = Router();

interface StateItem {
  state: string;
  districts: string[];
}

interface StatesResponse {
  states: StateItem[];
}

let cachedData: StateItem[] | null = null;

// Fallback data in case the external API is unreachable
const fallbackData: StateItem[] = [
  {
    state: "Delhi (NCT)",
    districts: ["New Delhi", "Central Delhi", "East Delhi", "North Delhi", "North East Delhi", "North West Delhi", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi", "Shahdara"]
  },
  {
    state: "Maharashtra",
    districts: ["Mumbai City", "Mumbai Suburban", "Pune", "Thane", "Nagpur", "Nashik", "Aurangabad", "Solapur"]
  },
  {
    state: "Karnataka",
    districts: ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Mangaluru", "Hubli-Dharwad", "Belagavi"]
  },
  {
    state: "Telangana",
    districts: ["Hyderabad", "Rangareddy", "Medchal-Malkajgiri", "Warangal", "Karimnagar"]
  },
  {
    state: "Haryana",
    districts: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Panchkula", "Karnal", "Sonipat"]
  },
  {
    state: "Uttar Pradesh",
    districts: ["Gautam Buddha Nagar (Noida/Greater Noida)", "Ghaziabad", "Lucknow", "Kanpur Nagar", "Agra", "Varanasi", "Meerut"]
  }
];

async function getLocationsData(): Promise<StateItem[]> {
  if (cachedData) {
    return cachedData;
  }

  try {
    const res = await fetch("https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const json = (await res.json()) as StatesResponse;
    if (json && Array.isArray(json.states)) {
      cachedData = json.states;
      return cachedData;
    }
    throw new Error("Invalid response format");
  } catch (err) {
    console.error("Failed to fetch locations from API, using fallback data", err);
    return fallbackData;
  }
}

// GET /api/locations/states
router.get("/states", async (req: Request, res: Response) => {
  try {
    const data = await getLocationsData();
    const states = data.map(item => item.state).sort();
    return res.json({
      success: true,
      data: states
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch states"
    });
  }
});

// GET /api/locations/districts?state=StateName
router.get("/districts", async (req: Request, res: Response) => {
  try {
    const { state } = req.query;
    if (!state || typeof state !== "string") {
      return res.status(400).json({
        success: false,
        error: "state query parameter is required"
      });
    }

    const data = await getLocationsData();
    const stateObj = data.find(item => item.state.toLowerCase() === state.toLowerCase());
    
    if (!stateObj) {
      return res.status(404).json({
        success: false,
        error: "State not found"
      });
    }

    return res.json({
      success: true,
      data: stateObj.districts.sort()
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch districts"
    });
  }
});

export default router;
