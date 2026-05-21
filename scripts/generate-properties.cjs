const fs = require('fs')
const path = require('path')

const cities = [
  'Delhi',
  'Mumbai',
  'Pune',
  'Bengaluru',
  'Chennai',
  'Hyderabad',
  'Ahmedabad',
  'Kolkata',
  'Jaipur',
  'Lucknow',
]

const firstNames = [
  'Aarav',
  'Vivaan',
  'Aditya',
  'Ramesh',
  'Suresh',
  'Priya',
  'Ananya',
  'Kavya',
  'Neha',
  'Rahul',
  'Meera',
  'Arjun',
  'Kiran',
  'Sunita',
  'Vikram',
  'Isha',
]

const lastNames = [
  'Sharma',
  'Verma',
  'Patel',
  'Kumar',
  'Singh',
  'Gupta',
  'Reddy',
  'Iyer',
  'Nair',
  'Das',
  'Mehta',
  'Joshi',
  'Mishra',
  'Chopra',
  'Bose',
  'Khan',
]

const propertyTypes = ['Residential', 'Commercial', 'Industrial']
const wards = ['Ward A', 'Ward B', 'Ward C', 'Ward D', 'Ward E', 'Ward F', 'Ward G', 'Ward H']
const statusPattern = [
  'Approved',
  'Approved',
  'Approved',
  'Approved',
  'Approved',
  'Approved',
  'Pending',
  'Pending',
  'Rejected',
  'Rejected',
]

const cityCode = {
  Delhi: 'DEL',
  Mumbai: 'MUM',
  Pune: 'PUN',
  Bengaluru: 'BLR',
  Chennai: 'CHE',
  Hyderabad: 'HYD',
  Ahmedabad: 'AMD',
  Kolkata: 'KOL',
  Jaipur: 'JAI',
  Lucknow: 'LKO',
}

const cityRate = {
  Delhi: 9.8,
  Mumbai: 13.4,
  Pune: 8.6,
  Bengaluru: 10.2,
  Chennai: 9.3,
  Hyderabad: 8.9,
  Ahmedabad: 7.7,
  Kolkata: 8.1,
  Jaipur: 6.9,
  Lucknow: 6.5,
}

const locality = {
  Delhi: 'Sector',
  Mumbai: 'Andheri',
  Pune: 'Kothrud',
  Bengaluru: 'Indiranagar',
  Chennai: 'T Nagar',
  Hyderabad: 'Gachibowli',
  Ahmedabad: 'Navrangpura',
  Kolkata: 'Salt Lake',
  Jaipur: 'Malviya Nagar',
  Lucknow: 'Gomti Nagar',
}

const rows = []

for (let i = 0; i < 1000; i += 1) {
  const tenant = cities[i % cities.length]
  const cityIndex = cities.indexOf(tenant)
  const citySeq = Math.floor(i / cities.length) + 1
  const propertyType = propertyTypes[(i + cityIndex) % propertyTypes.length]
  const status = statusPattern[(i + cityIndex * 2) % statusPattern.length]
  const area = 650 + ((i * 137 + cityIndex * 211) % 4650)
  const floorCount = 1 + ((i + cityIndex) % 8)
  const multiplier = propertyType === 'Commercial' ? 1.65 : propertyType === 'Industrial' ? 2.1 : 1
  const annualTax = Number((area * cityRate[tenant] * multiplier + floorCount * 420).toFixed(2))
  const year = 2020 + (i % 5)
  const month = String(1 + ((i * 7) % 12)).padStart(2, '0')
  const day = String(1 + ((i * 13) % 28)).padStart(2, '0')

  rows.push({
    property_id: `UPYOG-${cityCode[tenant]}-${String(citySeq).padStart(4, '0')}`,
    tenant,
    owner_name: `${firstNames[(i + cityIndex) % firstNames.length]} ${
      lastNames[(i * 3 + cityIndex) % lastNames.length]
    }`,
    property_type: propertyType,
    ward: wards[(i + cityIndex * 3) % wards.length],
    area_sqft: area,
    status,
    annual_tax_inr: annualTax,
    collection_inr: status === 'Approved' ? annualTax : 0,
    registration_date: `${year}-${month}-${day}`,
    floor_count: floorCount,
    address: `${10 + (i % 190)}, ${locality[tenant]} ${1 + (citySeq % 24)}, ${tenant}`,
  })
}

fs.writeFileSync(path.join(__dirname, '..', 'src', 'properties.json'), `${JSON.stringify(rows, null, 2)}\n`)
console.log(`Generated ${rows.length} records in src/properties.json`)
