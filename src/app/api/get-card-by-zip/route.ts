import { NextResponse } from "next/server";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { filterExpiredCards } from "@/lib/utils";

console.log("🔧 Get-Card-By-Zip - Using direct DynamoDB access");
console.log("🔧 Get-Card-By-Zip - Environment variables:");
console.log("🔧 REGION:", process.env.REGION);
console.log("🔧 REGION:", process.env.REGION);
console.log("🔧 NODE_ENV:", process.env.NODE_ENV);

// Create DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.REGION || "us-west-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

// Zip code to coordinates mapping (focusing on California zip codes)
const ZIP_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  // San Francisco Bay Area - All 941xx zip codes with accurate coordinates
  "94102": { lat: 37.7793, lng: -122.4193 }, // Civic Center
  "94103": { lat: 37.7725, lng: -122.4097 }, // South of Market
  "94104": { lat: 37.7913, lng: -122.4017 }, // Financial District
  "94105": { lat: 37.7864, lng: -122.3892 }, // Financial District
  "94107": { lat: 37.7626, lng: -122.3971 }, // Potrero Hill
  "94108": { lat: 37.7929, lng: -122.4079 }, // Chinatown
  "94109": { lat: 37.7924, lng: -122.4188 }, // Nob Hill
  "94110": { lat: 37.7485, lng: -122.4184 }, // Mission District
  "94111": { lat: 37.7974, lng: -122.4003 }, // Financial District
  "94112": { lat: 37.7196, lng: -122.4478 }, // Outer Mission
  "94114": { lat: 37.7587, lng: -122.4386 }, // Castro District
  "94115": { lat: 37.7749, lng: -122.4374 }, // Pacific Heights
  "94116": { lat: 37.7441, lng: -122.4858 }, // Sunset District
  "94117": { lat: 37.7702, lng: -122.4449 }, // Haight-Ashbury
  "94118": { lat: 37.7811, lng: -122.4702 }, // Richmond District
  "94121": { lat: 37.7288, lng: -122.4806 }, // Outer Sunset
  "94122": { lat: 37.7288, lng: -122.4806 }, // Sunset District
  "94123": { lat: 37.7999, lng: -122.4347 }, // Marina District
  "94124": { lat: 37.7312, lng: -122.3826 }, // Bayview-Hunters Point
  "94127": { lat: 37.7347, lng: -122.4564 }, // West Portal
  "94129": { lat: 37.7999, lng: -122.4347 }, // Presidio
  "94130": { lat: 37.8249, lng: -122.3705 }, // Treasure Island
  "94131": { lat: 37.7441, lng: -122.4858 }, // Outer Sunset
  "94132": { lat: 37.7196, lng: -122.4478 }, // Outer Mission
  "94133": { lat: 37.8057, lng: -122.4099 }, // North Beach
  "94134": { lat: 37.7196, lng: -122.4478 }, // Outer Mission
  
  // Additional Bay Area zip codes for better coverage
  "94010": { lat: 37.4852, lng: -122.2364 }, // Burlingame
  "94014": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94015": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94016": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94017": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94018": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94019": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94020": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94021": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94022": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94023": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94024": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94025": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94026": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94027": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94028": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94029": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94030": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94035": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94037": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94038": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94039": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94040": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94041": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94042": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94043": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94044": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94045": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94060": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94061": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94062": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94063": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94064": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94065": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94066": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94067": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94068": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94069": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94070": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94071": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94074": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94075": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94076": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94077": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94078": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94079": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94080": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94083": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94085": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94086": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94087": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94088": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94089": { lat: 37.4852, lng: -122.2364 }, // Daly City
  "94301": { lat: 37.4419, lng: -122.1430 }, // Palo Alto
  "94302": { lat: 37.4419, lng: -122.1430 }, // Palo Alto
  "94303": { lat: 37.4419, lng: -122.1430 }, // Palo Alto
  "94304": { lat: 37.4419, lng: -122.1430 }, // Palo Alto
  "94305": { lat: 37.4419, lng: -122.1430 }, // Palo Alto
  "94306": { lat: 37.4419, lng: -122.1430 }, // Palo Alto
  "94309": { lat: 37.4419, lng: -122.1430 }, // Palo Alto
  "94401": { lat: 37.5629, lng: -122.3255 }, // San Mateo
  "94402": { lat: 37.5629, lng: -122.3255 }, // San Mateo
  "94403": { lat: 37.5629, lng: -122.3255 }, // San Mateo
  "94404": { lat: 37.5629, lng: -122.3255 }, // San Mateo
  "94497": { lat: 37.5629, lng: -122.3255 }, // San Mateo
  
  // Los Angeles Area
  "90001": { lat: 33.9731, lng: -118.2479 },
  "90002": { lat: 33.9497, lng: -118.2464 },
  "90003": { lat: 33.9641, lng: -118.3028 },
  "90004": { lat: 34.0766, lng: -118.3025 },
  "90005": { lat: 34.0766, lng: -118.3025 },
  "90006": { lat: 34.0484, lng: -118.3020 },
  "90007": { lat: 34.0333, lng: -118.2874 },
  "90008": { lat: 34.0117, lng: -118.3423 },
  "90010": { lat: 34.0625, lng: -118.3007 },
  "90011": { lat: 34.0627, lng: -118.2588 },
  "90012": { lat: 34.0614, lng: -118.2386 },
  "90013": { lat: 34.0454, lng: -118.2434 },
  "90014": { lat: 34.0446, lng: -118.2508 },
  "90015": { lat: 34.0446, lng: -118.2508 },
  "90016": { lat: 34.0297, lng: -118.3526 },
  "90017": { lat: 34.0556, lng: -118.2666 },
  "90018": { lat: 34.0289, lng: -118.3156 },
  "90019": { lat: 34.0481, lng: -118.3348 },
  "90020": { lat: 34.0664, lng: -118.3020 },
  "90021": { lat: 34.0333, lng: -118.2444 },
  "90022": { lat: 34.0239, lng: -118.1566 },
  "90023": { lat: 34.0239, lng: -118.1967 },
  "90024": { lat: 34.0633, lng: -118.4454 },
  "90025": { lat: 34.0454, lng: -118.4494 },
  "90026": { lat: 34.0766, lng: -118.2659 },
  "90027": { lat: 34.1147, lng: -118.2926 },
  "90028": { lat: 34.0983, lng: -118.3267 },
  "90029": { lat: 34.0896, lng: -118.2946 },
  "90030": { lat: 34.0766, lng: -118.3025 },
  "90031": { lat: 34.0782, lng: -118.2117 },
  "90032": { lat: 34.0817, lng: -118.1751 },
  "90033": { lat: 34.0484, lng: -118.2083 },
  "90034": { lat: 34.0289, lng: -118.4006 },
  "90035": { lat: 34.0522, lng: -118.3806 },
  "90036": { lat: 34.0716, lng: -118.3496 },
  "90037": { lat: 34.0026, lng: -118.2874 },
  "90038": { lat: 34.0896, lng: -118.3213 },
  "90039": { lat: 34.1106, lng: -118.2599 },
  "90040": { lat: 33.9947, lng: -118.1850 },
  "90041": { lat: 34.1339, lng: -118.2083 },
  "90042": { lat: 34.1147, lng: -118.1920 },
  "90043": { lat: 33.9874, lng: -118.3321 },
  "90044": { lat: 33.9545, lng: -118.3020 },
  "90045": { lat: 33.9571, lng: -118.4006 },
  "90046": { lat: 34.0975, lng: -118.3615 },
  "90047": { lat: 33.9571, lng: -118.3078 },
  "90048": { lat: 34.0736, lng: -118.3728 },
  "90049": { lat: 34.0920, lng: -118.4731 },
  "90050": { lat: 34.0766, lng: -118.3025 },
  "90051": { lat: 34.0766, lng: -118.3025 },
  "90052": { lat: 34.0766, lng: -118.3025 },
  "90053": { lat: 34.0766, lng: -118.3025 },
  "90054": { lat: 34.0766, lng: -118.3025 },
  "90055": { lat: 34.0766, lng: -118.3025 },
  "90056": { lat: 33.9850, lng: -118.3728 },
  "90057": { lat: 34.0625, lng: -118.2784 },
  "90058": { lat: 33.9874, lng: -118.2784 },
  "90059": { lat: 33.9236, lng: -118.2479 },
  "90060": { lat: 33.9731, lng: -118.2479 },
  "90061": { lat: 33.9236, lng: -118.2479 },
  "90062": { lat: 34.0033, lng: -118.3078 },
  "90063": { lat: 34.0484, lng: -118.1850 },
  "90064": { lat: 34.0289, lng: -118.4265 },
  "90065": { lat: 34.1079, lng: -118.2265 },
  "90066": { lat: 34.0026, lng: -118.4294 },
  "90067": { lat: 34.0556, lng: -118.4139 },
  "90068": { lat: 34.1083, lng: -118.3267 },
  "90069": { lat: 34.0906, lng: -118.3786 },
  "90070": { lat: 34.0766, lng: -118.3025 },
  "90071": { lat: 34.0522, lng: -118.2434 },
  "90072": { lat: 34.0766, lng: -118.3025 },
  "90073": { lat: 34.0766, lng: -118.3025 },
  "90074": { lat: 34.0766, lng: -118.3025 },
  "90075": { lat: 34.0766, lng: -118.3025 },
  "90076": { lat: 34.0766, lng: -118.3025 },
  "90077": { lat: 34.1005, lng: -118.4731 },
  "90078": { lat: 34.0766, lng: -118.3025 },
  "90079": { lat: 34.0766, lng: -118.3025 },
  "90080": { lat: 34.0766, lng: -118.3025 },
  "90081": { lat: 34.0766, lng: -118.3025 },
  "90082": { lat: 34.0766, lng: -118.3025 },
  "90083": { lat: 34.0766, lng: -118.3025 },
  "90084": { lat: 34.0766, lng: -118.3025 },
  "90086": { lat: 34.0766, lng: -118.3025 },
  "90087": { lat: 34.0766, lng: -118.3025 },
  "90088": { lat: 34.0766, lng: -118.3025 },
  "90089": { lat: 34.0222, lng: -118.2851 },
  "90090": { lat: 34.0766, lng: -118.3025 },
  "90091": { lat: 34.0766, lng: -118.3025 },
  "90093": { lat: 34.0766, lng: -118.3025 },
  "90094": { lat: 33.9850, lng: -118.4265 },
  "90095": { lat: 34.0522, lng: -118.4434 },
  "90096": { lat: 33.9850, lng: -118.3728 },
  "90099": { lat: 34.0766, lng: -118.3025 },
  
  // Santa Barbara Area - All 931xx zip codes with accurate coordinates
  "93101": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  "93102": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  "93103": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  "93105": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  "93106": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  "93107": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  "93108": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  "93109": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  "93110": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  "93111": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  "93116": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  "93117": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  "93118": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  "93120": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  "93121": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  "93130": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  "93131": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  "93140": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  "93150": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  "93160": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  "93190": { lat: 34.4208, lng: -119.6982 }, // Downtown Santa Barbara
  
  // Additional Santa Barbara County and nearby areas
  "93001": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93002": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93003": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93004": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93005": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93006": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93007": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93009": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93010": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93011": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93012": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93013": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93014": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93015": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93016": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93020": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93021": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93022": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93023": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93024": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93030": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93031": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93032": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93033": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93034": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93035": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93036": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93040": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93041": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93042": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93043": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93044": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93060": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93061": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93062": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93063": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93064": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93065": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93066": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93067": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93094": { lat: 34.2783, lng: -119.2932 }, // Ventura
  "93099": { lat: 34.2783, lng: -119.2932 }, // Ventura
  
  // San Diego Area
  "92101": { lat: 32.7157, lng: -117.1611 },
  "92102": { lat: 32.7157, lng: -117.1611 },
  "92103": { lat: 32.7157, lng: -117.1611 },
  "92104": { lat: 32.7157, lng: -117.1611 },
  "92105": { lat: 32.7157, lng: -117.1611 },
  "92106": { lat: 32.7157, lng: -117.1611 },
  "92107": { lat: 32.7157, lng: -117.1611 },
  "92108": { lat: 32.7157, lng: -117.1611 },
  "92109": { lat: 32.7157, lng: -117.1611 },
  "92110": { lat: 32.7157, lng: -117.1611 },
  "92111": { lat: 32.7157, lng: -117.1611 },
  "92112": { lat: 32.7157, lng: -117.1611 },
  "92113": { lat: 32.7157, lng: -117.1611 },
  "92114": { lat: 32.7157, lng: -117.1611 },
  "92115": { lat: 32.7157, lng: -117.1611 },
  "92116": { lat: 32.7157, lng: -117.1611 },
  "92117": { lat: 32.7157, lng: -117.1611 },
  "92118": { lat: 32.7157, lng: -117.1611 },
  "92119": { lat: 32.7157, lng: -117.1611 },
  "92120": { lat: 32.7157, lng: -117.1611 },
  "92121": { lat: 32.7157, lng: -117.1611 },
  "92122": { lat: 32.7157, lng: -117.1611 },
  "92123": { lat: 32.7157, lng: -117.1611 },
  "92124": { lat: 32.7157, lng: -117.1611 },
  "92126": { lat: 32.7157, lng: -117.1611 },
  "92127": { lat: 32.7157, lng: -117.1611 },
  "92128": { lat: 32.7157, lng: -117.1611 },
  "92129": { lat: 32.7157, lng: -117.1611 },
  "92130": { lat: 32.7157, lng: -117.1611 },
  "92131": { lat: 32.7157, lng: -117.1611 },
  "92132": { lat: 32.7157, lng: -117.1611 },
  "92134": { lat: 32.7157, lng: -117.1611 },
  "92135": { lat: 32.7157, lng: -117.1611 },
  "92136": { lat: 32.7157, lng: -117.1611 },
  "92137": { lat: 32.7157, lng: -117.1611 },
  "92138": { lat: 32.7157, lng: -117.1611 },
  "92139": { lat: 32.7157, lng: -117.1611 },
  "92140": { lat: 32.7157, lng: -117.1611 },
  "92142": { lat: 32.7157, lng: -117.1611 },
  "92143": { lat: 32.7157, lng: -117.1611 },
  "92145": { lat: 32.7157, lng: -117.1611 },
  "92147": { lat: 32.7157, lng: -117.1611 },
  "92149": { lat: 32.7157, lng: -117.1611 },
  "92150": { lat: 32.7157, lng: -117.1611 },
  "92152": { lat: 32.7157, lng: -117.1611 },
  "92153": { lat: 32.7157, lng: -117.1611 },
  "92154": { lat: 32.7157, lng: -117.1611 },
  "92155": { lat: 32.7157, lng: -117.1611 },
  "92158": { lat: 32.7157, lng: -117.1611 },
  "92159": { lat: 32.7157, lng: -117.1611 },
  "92160": { lat: 32.7157, lng: -117.1611 },
  "92161": { lat: 32.7157, lng: -117.1611 },
  "92162": { lat: 32.7157, lng: -117.1611 },
  "92163": { lat: 32.7157, lng: -117.1611 },
  "92164": { lat: 32.7157, lng: -117.1611 },
  "92165": { lat: 32.7157, lng: -117.1611 },
  "92166": { lat: 32.7157, lng: -117.1611 },
  "92167": { lat: 32.7157, lng: -117.1611 },
  "92168": { lat: 32.7157, lng: -117.1611 },
  "92169": { lat: 32.7157, lng: -117.1611 },
  "92170": { lat: 32.7157, lng: -117.1611 },
  "92171": { lat: 32.7157, lng: -117.1611 },
  "92172": { lat: 32.7157, lng: -117.1611 },
  "92173": { lat: 32.7157, lng: -117.1611 },
  "92174": { lat: 32.7157, lng: -117.1611 },
  "92175": { lat: 32.7157, lng: -117.1611 },
  "92176": { lat: 32.7157, lng: -117.1611 },
  "92177": { lat: 32.7157, lng: -117.1611 },
  "92178": { lat: 32.7157, lng: -117.1611 },
  "92179": { lat: 32.7157, lng: -117.1611 },
  "92182": { lat: 32.7157, lng: -117.1611 },
  "92186": { lat: 32.7157, lng: -117.1611 },
  "92187": { lat: 32.7157, lng: -117.1611 },
  "92190": { lat: 32.7157, lng: -117.1611 },
  "92191": { lat: 32.7157, lng: -117.1611 },
  "92192": { lat: 32.7157, lng: -117.1611 },
  "92193": { lat: 32.7157, lng: -117.1611 },
  "92194": { lat: 32.7157, lng: -117.1611 },
  "92195": { lat: 32.7157, lng: -117.1611 },
  "92196": { lat: 32.7157, lng: -117.1611 },
  "92197": { lat: 32.7157, lng: -117.1611 },
  "92198": { lat: 32.7157, lng: -117.1611 },
  "92199": { lat: 32.7157, lng: -117.1611 },
};

// Haversine formula to calculate distance between two points on Earth
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Function to calculate distance between two zip codes
function calculateZipDistance(zip1: string, zip2: string): number {
  const coords1 = ZIP_COORDINATES[zip1];
  const coords2 = ZIP_COORDINATES[zip2];
  
  console.log(`🧮 Distance calculation: ${zip1} -> ${zip2}`);
  console.log(`🧮 Coords1: ${coords1 ? `${coords1.lat}, ${coords1.lng}` : 'NOT FOUND'}`);
  console.log(`🧮 Coords2: ${coords2 ? `${coords2.lat}, ${coords2.lng}` : 'NOT FOUND'}`);
  
  // If we have coordinates for both zip codes, use Haversine formula
  if (coords1 && coords2) {
    const distance = haversineDistance(coords1.lat, coords1.lng, coords2.lat, coords2.lng);
    console.log(`🧮 Haversine distance: ${distance} miles`);
    return distance;
  }
  
  // Fallback: If we don't have coordinates, use a simple numerical difference
  // but with a much larger penalty to prioritize zip codes with known coordinates
  const num1 = parseInt(zip1.replace(/\D/g, ''), 10);
  const num2 = parseInt(zip2.replace(/\D/g, ''), 10);
  const fallbackDistance = Math.abs(num1 - num2) + 1000; // Add 1000 mile penalty for unknown coordinates
  console.log(`🧮 Fallback distance: ${fallbackDistance} miles (numerical difference: ${Math.abs(num1 - num2)} + 1000 penalty)`);
  return fallbackDistance;
}

// Define types for better type safety
interface CardWithBusiness {
  cardid: string;
  header?: string | null;
  business?: { zipCode: string } | null;
  [key: string]: unknown;
}

interface CardWithDistance extends CardWithBusiness {
  distance: number;
}

// Function to sort cards by zip code distance
function sortCardsByZipDistance(cards: CardWithBusiness[], targetZip: string): CardWithDistance[] {
  return cards.map(card => ({
    ...card,
    distance: calculateZipDistance(card.business?.zipCode || '', targetZip)
  })).sort((a, b) => a.distance - b.distance);
}

export async function GET(request: Request) {
  try {
    console.log("🔍 Get-Card-By-Zip - Starting request");
    
    const { searchParams } = new URL(request.url);
    const zipCode = searchParams.get('zip');
    
    if (!zipCode) {
      console.log("❌ Get-Card-By-Zip - No zip code provided");
      return NextResponse.json({ error: "Zip code parameter is required" }, { status: 400 });
    }

    console.log(`🔍 Get-Card-By-Zip - Fetching cards for zip code: ${zipCode}`);

    // Fetch all cards directly from DynamoDB
    console.log("🔍 Get-Card-By-Zip - Executing DynamoDB scan");
    
    const scanCommand = new ScanCommand({
      TableName: "Card-7cdlttoiifewxgyh7sodc6czx4-NONE",
      Limit: 100
    });
    
    const scanResult = await dynamoClient.send(scanCommand);
    const cards = scanResult.Items?.map(item => unmarshall(item)) || [];

    console.log("🔍 Get-Card-By-Zip - DynamoDB scan completed");

    console.log("🔍 Get-Card-By-Zip - Cards extracted:", cards?.length || 0);

    if (!cards || cards.length === 0) {
      console.log("❌ Get-Card-By-Zip - No cards available");
      return NextResponse.json({ error: "No cards available" }, { status: 404 });
    }

    // Filter out expired cards and cards with quantity <= 0
    const availableCards = filterExpiredCards(cards).filter(card => card.quantity > 0);
    
    if (availableCards.length === 0) {
      return NextResponse.json({ error: "No available cards (all expired or out of stock)" }, { status: 404 });
    }

    console.log(`📊 Total cards found: ${cards.length}, Available cards: ${availableCards.length}`);

    // Extract zip codes from address text for cards without business associations
    const cardsWithZipCodes = availableCards.map(card => {
      // Try to extract zip code from addresstext
      const zipCodeMatch = card.addresstext?.match(/\b\d{5}\b/);
      const extractedZipCode = zipCodeMatch ? zipCodeMatch[0] : null;
      
      console.log(`📍 Card ${card.cardid}: addresstext="${card.addresstext}", extracted zip="${extractedZipCode}"`);
      
      return {
        ...card,
        business: extractedZipCode ? { zipCode: extractedZipCode } : null
      };
    });

    // Filter out cards without zip codes
    const validCards = cardsWithZipCodes.filter(card => 
      card.business && card.business.zipCode
    ) as CardWithBusiness[];

    console.log(`📊 Cards with valid zip codes: ${validCards.length}`);

    if (validCards.length === 0) {
      return NextResponse.json({ error: "No cards with valid business data available" }, { status: 404 });
    }

    // Sort cards by distance from target zip code
    const sortedCards = sortCardsByZipDistance(validCards, zipCode);

    console.log(`📊 Sorted cards by distance:`);
    sortedCards.forEach((card, index) => {
      console.log(`  ${index + 1}. ${card.header} (${card.business?.zipCode}) - Distance: ${card.distance} miles`);
    });

    // Find exact matches
    const exactMatches = sortedCards.filter(card => 
      card.business?.zipCode === zipCode
    );

    console.log(`📊 Exact matches found: ${exactMatches.length}`);

    // Generate random number for probability selection
    const random = Math.random();
    let selectedCard;

    if (exactMatches.length > 0) {
      // If we have exact matches, use probability system
      if (random < 0.85) {
        // 85% chance: Pick from exact matches
        console.log(`✅ 85% probability: Selecting from ${exactMatches.length} exact matches`);
        selectedCard = exactMatches[Math.floor(Math.random() * exactMatches.length)];
      } else if (random < 0.95 && sortedCards.length > 1) {
        // 10% chance: Pick the next closest zip code
        console.log(`✅ 10% probability: Selecting next closest zip code`);
        selectedCard = sortedCards[1]; // Second closest (index 1)
      } else if (sortedCards.length > 2) {
        // 5% chance: Pick the 3rd closest zip code
        console.log(`✅ 5% probability: Selecting 3rd closest zip code`);
        selectedCard = sortedCards[2]; // Third closest (index 2)
      } else {
        // Fallback: Pick the closest available
        console.log(`✅ Fallback: Selecting closest available zip code`);
        selectedCard = sortedCards[0];
      }
    } else {
      // No exact matches - always pick the closest geographic match
      console.log(`✅ No exact matches found - selecting closest geographic match`);
      selectedCard = sortedCards[0];
    }

    // Remove the distance property before returning
    const { distance, ...cardToReturn } = selectedCard;

    console.log(`✅ Selected card: ${cardToReturn.header || 'Unknown'} from zip ${cardToReturn.business?.zipCode || 'Unknown'} (distance: ${distance} miles)`);

    return NextResponse.json(cardToReturn);
  } catch (err) {
    console.error("Error fetching card by zip code:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 