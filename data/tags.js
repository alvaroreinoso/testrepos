const tags = [
    {
        type: 'Accessorial',
        content: 'Block & Brace',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Accessorial',
        content: 'Demurrage',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Accessorial',
        content: 'Detention',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Accessorial',
        content: 'Drop Trailer',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Accessorial',
        content: 'Labor',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Accessorial',
        content: 'Loading Charge',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Accessorial',
        content: 'Lumper',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Accessorial',
        content: 'Misc.',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Accessorial',
        content: 'Overdimensional',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Accessorial',
        content: 'Overweight',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Accessorial',
        content: 'Permits',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Accessorial',
        content: 'Pick & Pack',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Accessorial',
        content: 'Unloading Charge',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Accessorial',
        content: 'Weekend',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Tarp',
        content: `4' tarp`,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Tarp',
        content: `6' tarp`,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Tarp',
        content: `8' tarp`,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment',
        content: 'Van',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment',
        content: 'Van - Air Ride',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment',
        content: 'Van - Vented',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment',
        content: 'Van w/ Curtaiins',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment',
        content: 'Reefer',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment',
        content: 'Flatbed',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment',
        content: 'Stepdeck',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment',
        content: 'Hotshot',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment',
        content: 'Double Drop',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment',
        content: 'Lowboy',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment',
        content: 'Maxi',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment',
        content: 'Hopper Bottom',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment',
        content: 'Tanker',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment',
        content: 'Power Only',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment',
        content: 'Box Truck',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment',
        content: 'Sprinter Van',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment',
        content: 'Auto Carrier',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment',
        content: 'Dump Trailer',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment Length',
        content: `53'`,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment Length',
        content: `48'`,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment Length',
        content: `45'`,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment Length',
        content: `40'`,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment Length',
        content: `28'`,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment Length',
        content: `20'`,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Location',
        content: 'Appt. Only',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Location',
        content: '24 Hours',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Location',
        content: 'FCFS',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Location',
        content: 'Night Only',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Location',
        content: 'Live Load',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Location',
        content: 'Live Unload',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Location',
        content: 'Drop & Hook',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Location',
        content: 'Dropyard',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Location',
        content: 'No Loading Dock',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Load',
        content: 'Full Load',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Load',
        content: 'Partial',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Load',
        content: 'Team Drivers',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Commodity',
        content: 'Palletized',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Commodity',
        content: 'Drums',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Commodity',
        content: 'Floor Loaded',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Commodity',
        content: 'Bags',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Commodity',
        content: 'Rolls',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Commodity',
        content: 'Boxed',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Commodity',
        content: 'Wrapped',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Commodity',
        content: 'Straps',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Commodity',
        content: 'Load Locks',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Commodity',
        content: 'Refridgerated',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Commodity',
        content: 'Frozen',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Commodity',
        content: 'Fresh',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Commodity',
        content: 'Food Grade',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Commodity',
        content: 'Hazardous',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Commodity',
        content: 'Liquid',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Commodity',
        content: 'High Value',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Commodity',
        content: 'Live Animals',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Load',
        content: 'Full Load',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Load',
        content: 'Partial Load',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        type: 'Equipment',
        content: 'Team Drivers',
        createdAt: new Date(),
        updatedAt: new Date()
    },
]

module.exports = tags;