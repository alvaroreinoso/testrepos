const faker = require('faker');

const locations = [
    {
        "address": "6185 Kimball Ave",
        "address2": "",
        "city": "Chino",
        "state": "CA",
        "zipcode": 91708,
        "isHQ": true,
        "isShippingReceiving": true,
        "lnglat": "-117.67038,33.96662",
        brokerageId: 1,
        ledgerId: 29,
        phone: faker.phone.phoneNumber(),
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "3201 Capital Blvd",
        "address2": "",
        "city": "Rockwall",
        "state": "TX",
        "zipcode": 75032,
        "isHQ": false,
        "isShippingReceiving": true,
        "lnglat": "-96.44419,32.81259",
        brokerageId: 1,
        ledgerId: 30,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 3,
        "address": "6C Terminal Way",
        "address2": "",
        "city": "Avenel",
        "state": "NJ",
        "zipcode": 7001,
        // "open": "",
        // "close": "",
        "isHQ": false,
        "isShippingReceiving": true,
        "lnglat": "-74.262140,40.594690",
        brokerageId: 1,
        ledgerId: 31,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 4,
        "address": "2000 Hall Blvd",
        "address2": "",
        "city": "Ponca City",
        "state": "OK",
        "zipcode": 74601,
        // "open": "",
        // "close": "",
        "isHQ": false,
        "isShippingReceiving": true,
        "lnglat": "-97.109800,36.726320",
        brokerageId: 1,
        ledgerId: 32,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 5,
        "address": "125 E York St",
        "address2": "",
        "city": "Camden",
        "state": "SC",
        "zipcode": 29020,
        // "open": "",
        // "close": "",
        "isHQ": false,
        "isShippingReceiving": true,
        "lnglat": "-80.590009,34.243950",
        brokerageId: 1,
        ledgerId: 33,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 6,
        "address": "420 Straight Creek Rd",
        "address2": "",
        "city": "New Tazewell",
        "state": "TN",
        "zipcode": 37825,
        // "open": "",
        // "close": "",
        "isHQ": true,
        "isShippingReceiving": true,
        "lnglat": "-83.578033,36.441920",
        brokerageId: 1,
        ledgerId: 34,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 7,
        "address": "1 Caesarstone Dr",
        "address2": "",
        "city": "Midway",
        "state": "GA",
        "zipcode": 31320,
        // "open": "",
        // "close": "",
        "isHQ": true,
        "isShippingReceiving": true,
        "lnglat": "-81.351324,31.874845",
        brokerageId: 1,
        ledgerId: 35,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 8,
        "address": "2551 SW 39th St",
        "address2": "",
        "city": "Fort Lauderdale",
        "state": "FL",
        "zipcode": 33312,
        // "open": "",
        // "close": "",
        "isHQ": false,
        "isShippingReceiving": true,
        "lnglat": "-80.175726,26.074884",
        brokerageId: 1,
        ledgerId: 36,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 9,
        "address": "1010 Inteplast Blvd",
        "address2": "",
        "city": "Lolita",
        "state": "TX",
        "zipcode": 77971,
        // "open": "",
        // "close": "",
        "isHQ": true,
        "isShippingReceiving": true,
        "lnglat": "-96.553125,28.794657",
        brokerageId: 1,
        ledgerId: 37,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 10,
        "address": "1828 Metcalf Ave",
        "address2": "",
        "city": "Thomasville",
        "state": "GA",
        "zipcode": 31792,
        // "open": "",
        // "close": "",
        "isHQ": true,
        "isShippingReceiving": true,
        "lnglat": "-83.951470,30.830527",
        brokerageId: 1,
        ledgerId: 38,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 11,
        "address": "1586 Atlantic Ave",
        "address2": "",
        "city": "Henry",
        "state": "TN",
        "zipcode": 38231,
        // "open": "",
        // "close": "",
        "isHQ": true,
        "isShippingReceiving": true,
        "lnglat": "-88.432239,36.189507",
        brokerageId: 1,
        ledgerId: 39,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 12,
        "address": "5980 Hurt Road",
        "address2": "",
        "city": "Horn Lake",
        "state": "MS",
        "zipcode": 38637,
        // "open": "",
        // "close": "",
        "isHQ": false,
        "isShippingReceiving": true,
        "lnglat": "-90.033168,34.946122",
        brokerageId: 1,
        ledgerId: 40,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 13,
        "address": "4125 Farm Road 3417",
        "address2": "",
        "city": "Mount Pleasant",
        "state": "TX",
        "zipcode": 75455,
        // "open": "",
        // "close": "",
        "isHQ": false,
        "isShippingReceiving": true,
        "lnglat": "-94.971498,33.099430",
        brokerageId: 1,
        ledgerId: 41,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 14,
        "address": "4125 W Wrightwood Ave",
        "address2": "",
        "city": "Chicago",
        "state": "IL",
        "zipcode": 60639,
        // "open": "",
        // "close": "",
        "isHQ": true,
        "isShippingReceiving": false,
        "lnglat": "-87.729775,41.927475",
        brokerageId: 1,
        ledgerId: 42,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 15,
        "address": "9431 Bay Area Blvd",
        "address2": "",
        "city": "Pasadena",
        "state": "TX",
        "zipcode": 77507,
        // "open": "",
        // "close": "",
        "isHQ": false,
        "isShippingReceiving": true,
        "lnglat": "-95.069059,29.602662",
        brokerageId: 1,
        ledgerId: 43,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 16,
        "address": "1011 S Interstate 45 Service Road",
        "address2": "",
        "city": "Hutchins",
        "state": "TX",
        "zipcode": 75141,
        // "open": "",
        // "close": "",
        "isHQ": false,
        "isShippingReceiving": true,
        "lnglat": "-96.700486,32.634068",
        brokerageId: 1,
        ledgerId: 44,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 17,
        "address": "900 Terminal Road",
        "address2": "",
        "city": "Fort Worth",
        "state": "TX",
        "zipcode": 76106,
        // "open": "",
        // "close": "",
        "isHQ": false,
        "isShippingReceiving": true,
        "lnglat": "-97.343010,32.817189",
        brokerageId: 1,
        ledgerId: 45,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 18,
        "address": "437 Independence Pkwy",
        "address2": "",
        "city": "La Porte",
        "state": "TX",
        "zipcode": 77571,
        // "open": "",
        // "close": "",
        "isHQ": false,
        "isShippingReceiving": true,
        "lnglat": "-95.090895,29.710024",
        brokerageId: 1,
        ledgerId: 46,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 4,
        "address": "1030 Seymour Ave",
        "address2": "",
        "city": "Nasvhille",
        "state": "TN",
        "zipcode": 37206,
        // "open": "",
        // "close": "",
        "isHQ": true,
        "isShippingReceiving": true,
        "lnglat": "-86.750116,36.185708",
        brokerageId: 1,
        ledgerId: 47,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 4,
        "address": "101 W Fifth Ave",
        "address2": "",
        "city": "Knoxville",
        "state": "TN",
        "zipcode": 37917,
        // "open": "",
        // "close": "",
        "isHQ": true,
        "isShippingReceiving": true,
        "lnglat": "-83.920738,35.960636",
        brokerageId: 1,
        ledgerId: 48,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 4,
        "address": "60 Wall Street",
        "address2": "",
        "city": "New York",
        "state": "New York",
        "zipcode": 114109,
        // "open": "",
        // "close": "",
        "isHQ": true,
        "isShippingReceiving": true,
        "lnglat": "-74.008593,40.706002",
        brokerageId: 1,
        ledgerId: 49,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 4,
        "address": "20 W 34th St",
        "address2": "",
        "city": "New York",
        "state": "New York",
        "zipcode": 10001,
        // "open": "",
        // "close": "",
        "isHQ": true,
        "isShippingReceiving": true,
        "lnglat": "-73.9852,40.74861",
        brokerageId: 1,
        ledgerId: 50,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        //"contactId": 4,
        "address": "440 Terry Ave N",
        "address2": "",
        "city": "Seattle",
        "state": "WA",
        "zipcode": 98109,
        // "open": "",
        // "close": "",
        "isHQ": true,
        "isShippingReceiving": true,
        "lnglat": "-122.33676,47.622924",
        brokerageId: 1,
        ledgerId: 51,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "2403 Kline Ave",
        "address2": "",
        "city": "Nashville",
        "state": "TN",
        "zipcode": 37211,
        // "open": "",
        // "close": "",
        "lnglat": "-86.7524704,36.11983926",
        brokerageId: 1,
        ledgerId: 52,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "386 Industrial Dr S",
        "address2": "",
        "city": "Morgantown",
        "state": "KY",
        "zipcode": 42261,
        // "open": "",
        // "close": "",
        "lnglat": "-86.709192,37.207745",
        brokerageId: 1,
        ledgerId: 53,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "1859 Pacific Ave",
        "address2": "",
        "city": "Stockton",
        "state": "CA",
        "zipcode": 95204,
        // "open": "",
        // "close": "",
        "lnglat": "-121.311852,37.989843",
        brokerageId: 1,
        ledgerId: 54,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "523 Commerce Rd",
        "address2": "",
        "city": "Orem",
        "state": "UT",
        "zipcode": 84058,
        // "open": "",
        // "close": "",
        "lnglat": "-111.72863337,40.28782325",
        brokerageId: 1,
        ledgerId: 55,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "317 Nogalitos St",
        "address2": "",
        "city": "San Antonio",
        "state": "TX",
        "zipcode": 78204,
        // "open": "",
        // "close": "",
        "lnglat": "-98.50391514,29.40752816",
        brokerageId: 1,
        ledgerId: 56,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "8109 Lewis Rd",
        "address2": "",
        "city": "Minneapolis",
        "state": "MN",
        "zipcode": 55427,
        // "open": "",
        // "close": "",
        "lnglat": "-93.381863,44.987723",
        brokerageId: 1,
        ledgerId: 57,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "4441 Industrial Dr",
        "address2": "",
        "city": "Alton",
        "state": "IL",
        "zipcode": 62002,
        // "open": "",
        // "close": "",
        "lnglat": "-90.18429631,38.92952737",
        brokerageId: 1,
        ledgerId: 58,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "875 Skyway St",
        "address2": "",
        "city": "Presque Isle",
        "state": "ME",
        "zipcode": 4769,
        // "open": "",
        // "close": "",
        "lnglat": "-68.04158774,46.70009635",
        brokerageId: 1,
        ledgerId: 59,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "250 W Kensinger Dr",
        "address2": "Ste 100",
        "city": "Cranberry Twp",
        "state": "PA",
        "zipcode": 16066,
        // "open": "",
        // "close": "",
        "lnglat": "-80.11737812,40.71001957",
        brokerageId: 1,
        ledgerId: 60,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "101 N Omega St",
        "address2": "",
        "city": "Dexter",
        "state": "GA",
        "zipcode": 31019,
        // "open": "",
        // "close": "",
        "lnglat": "-83.0617098,32.4345442",
        brokerageId: 1,
        ledgerId: 61,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "1197 US-82",
        "address2": "",
        "city": "Stamps",
        "state": "AR",
        "zipcode": 71860,
        // "open": "",
        // "close": "",
        "lnglat": "-93.494995,33.365568",
        brokerageId: 1,
        ledgerId: 62,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "2056 S, MO-19",
        "address2": "",
        "city": "Hermann",
        "state": "MO",
        "zipcode": 65041,
        // "open": "",
        // "close": "",
        "lnglat": "-91.461885,38.497460",
        brokerageId: 1,
        ledgerId: 63,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "398 Victory Ave",
        "address2": "",
        "city": "Twin Falls",
        "state": "ID",
        "zipcode": 83301,
        // "open": "",
        // "close": "",
        "lnglat": "-114.48725327,42.55669131",
        brokerageId: 1,
        ledgerId: 64,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "19780 Jack Tone Rd",
        "address2": "",
        "city": "Manteca",
        "state": "CA",
        "zipcode": 95336,
        // "open": "",
        // "close": "",
        "lnglat": "-121.14276392,37.78000702",
        brokerageId: 1,
        ledgerId: 65,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "5263 Poplar Dr",
        "address2": "",
        "city": "Memphis",
        "state": "TN",
        "zipcode": 38119,
        // "open": "",
        // "close": "",
        "lnglat": "-89.885916,35.107648",
        brokerageId: 1,
        ledgerId: 66,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "7500 W 135th St",
        "address2": "",
        "city": "Overland Park",
        "state": "KS",
        "zipcode": 66223,
        // "open": "",
        // "close": "",
        "lnglat": "-94.67316299,38.88457385",
        brokerageId: 1,
        ledgerId: 67,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "10289 SW Parkview Rd",
        "address2": "",
        "city": "Augusta",
        "state": "KS",
        "zipcode": 67010,
        // "open": "",
        // "close": "",
        "lnglat": "-96.852691,37.674979",
        brokerageId: 1,
        ledgerId: 68,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "100 Belmont St",
        "address2": "",
        "city": "Clinton",
        "state": "MS",
        "zipcode": 39056,
        // "open": "",
        // "close": "",
        "lnglat": "-90.329521,32.342191",
        brokerageId: 1,
        ledgerId: 69,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "1599 Memorial Dr SE",
        "address2": "",
        "city": "Atlanta",
        "state": "GA",
        "zipcode": 30317,
        // "open": "",
        // "close": "",
        "lnglat": "-84.335974,33.746212",
        brokerageId: 1,
        ledgerId: 70,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "11400 IKEA Way",
        "address2": "",
        "city": "Fishers",
        "state": "IN",
        "zipcode": 46037,
        // "open": "",
        // "close": "",
        "lnglat": "-86.007374,39.953441",
        brokerageId: 1,
        ledgerId: 71,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "24635 John T Reid Pkwy",
        "address2": "",
        "city": "Scottsboro",
        "state": "AL",
        "zipcode": 35768,
        // "open": "",
        // "close": "",
        "lnglat": "-86.009766,34.664641",
        brokerageId: 1,
        ledgerId: 72,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "3101 Clark Butler Blvd",
        "address2": "",
        "city": "Gainesville",
        "state": "FL",
        "zipcode": 32608,
        // "open": "",
        // "close": "",
        "lnglat": "-82.380786,29.625476",
        brokerageId: 1,
        ledgerId: 73,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "14438 Lee Hwy",
        "address2": "",
        "city": "Bristol",
        "state": "VA",
        "zipcode": 24202,
        // "open": "",
        // "close": "",
        "lnglat": "-82.099221,36.642715",
        brokerageId: 1,
        ledgerId: 74,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "1300 Loveridge Rd",
        "address2": "",
        "city": "Pittsburg",
        "state": "CA",
        "zipcode": 94565,
        // "open": "",
        // "close": "",
        "lnglat": "-121.858218,38.018531",
        brokerageId: 1,
        ledgerId: 75,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "803 Industrial Blvd",
        "address2": "",
        "city": "Smyrna",
        "state": "TN",
        "zipcode": 37167,
        // "open": "",
        // "close": "",
        "lnglat": "-86.571144,35.979856",
        brokerageId: 1,
        ledgerId: 76,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "69015 LA-59",
        "address2": "",
        "city": "Mandeville",
        "state": "LA",
        "zipcode": 70471,
        // "open": "",
        // "close": "",
        "lnglat": "-90.041855,30.435943",
        brokerageId: 1,
        ledgerId: 77,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "12310 Panama City Beach Pkwy",
        "address2": "",
        "city": "Panama City",
        "state": "FL",
        "zipcode": 32407,
        // "open": "",
        // "close": "",
        "lnglat": "-85.829907,30.206657",
        brokerageId: 1,
        ledgerId: 78,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "5848 N Stiles Rd",
        "address2": "",
        "city": "Ludington",
        "state": "MI",
        "zipcode": 49431,
        // "open": "",
        // "close": "",
        "lnglat": "-86.340455,44.061244",
        brokerageId: 1,
        ledgerId: 79,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "1550 MS-30",
        "address2": "",
        "city": "Myrtle",
        "state": "MS",
        "zipcode": 38650,
        // "open": "",
        // "close": "",
        "lnglat": "-89.158054,34.467086",
        brokerageId: 1,
        ledgerId: 80,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "196 Concord St",
        "address2": "",
        "city": "Charleston",
        "state": "SC",
        "zipcode": 29401,
        // "open": "",
        // "close": "",
        "lnglat": "-79.923799,32.781291",
        brokerageId: 1,
        ledgerId: 81,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "218 Hill St",
        "address2": "",
        "city": "Santa Monica",
        "state": "CA",
        "zipcode": 90405,
        // "open": "",
        // "close": "",
        "lnglat": "-118.481990,34.001214",
        brokerageId: 1,
        ledgerId: 82,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "1983 State Line Rd",
        "address2": "",
        "city": "Joplin",
        "state": "MO",
        "zipcode": 64804,
        // "open": "",
        // "close": "",
        "lnglat": "-94.617788,37.074663",
        brokerageId: 1,
        ledgerId: 83,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "100 Hersheypark Dr",
        "address2": "",
        "city": "Hershey",
        "state": "PA",
        "zipcode": 17033,
        // "open": "",
        // "close": "",
        "lnglat": "-76.657862,40.293104",
        brokerageId: 1,
        ledgerId: 84,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "2557 Florence Harllee Blvd",
        "address2": "",
        "city": "Florence",
        "state": "SC",
        "zipcode": 29506,
        // "open": "",
        // "close": "",
        "lnglat": "-79.684989,34.268006",
        brokerageId: 1,
        ledgerId: 85,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "5689 Quince Rd",
        "address2": "",
        "city": "Memphis",
        "state": "TN",
        "zipcode": 38119,
        // "open": "",
        // "close": "",
        "lnglat": "-89.87360852,35.08942255",
        brokerageId: 1,
        ledgerId: 86,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "900 E 11th St",
        "address2": "",
        "city": "Austin",
        "state": "TX",
        "zipcode": 78702,
        // "open": "",
        // "close": "",
        "lnglat": "-97.731266,30.270113",
        brokerageId: 1,
        ledgerId: 87,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "147 E Butler Ave",
        "address2": "",
        "city": "Memphis",
        "state": "TN",
        "zipcode": 38103,
        // "open": "",
        // "close": "",
        "lnglat": "-90.05718244,35.13383755",
        brokerageId: 1,
        ledgerId: 88,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "3425 Lathrop St",
        "address2": "",
        "city": "South Bend",
        "state": "IN",
        "zipcode": 46628,
        // "open": "",
        // "close": "",
        "lnglat": "-86.29798512,41.70827007",
        brokerageId: 1,
        ledgerId: 89,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "2667 Gundry Ave",
        "address2": "",
        "city": "Signal Hill",
        "state": "CA",
        "zipcode": 90755,
        // "open": "",
        // "close": "",
        "lnglat": "-118.17423422,33.80560095",
        brokerageId: 1,
        ledgerId: 90,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "959 Ridgeway Loop Rd",
        "address2": "",
        "city": "Memphis",
        "state": "TN",
        "zipcode": 38120,
        // "open": "",
        // "close": "",
        "lnglat": "-89.86423545,35.10612208",
        brokerageId: 1,
        ledgerId: 91,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "1629 E Main St",
        "address2": "",
        "city": "Siloam Springs",
        "state": "AR",
        "zipcode": 72761,
        // "open": "",
        // "close": "",
        "lnglat": "-94.52499951,36.18141866",
        brokerageId: 1,
        ledgerId: 92,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "201 E Navajo Dr",
        "address2": "",
        "city": "Hobbs",
        "state": "NM",
        "zipcode": 88240,
        // "open": "",
        // "close": "",
        "lnglat": "-103.13527188,32.73943075",
        brokerageId: 1,
        ledgerId: 93,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "1950 Hidee Mine Rd",
        "address2": "",
        "city": "Central City",
        "state": "CO",
        "zipcode": 80427,
        // "open": "",
        // "close": "",
        "lnglat": "-105.5007428,39.7870643",
        brokerageId: 1,
        ledgerId: 94,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "21 MT-38",
        "address2": "",
        "city": "Philipsburg",
        "state": "MT",
        "zipcode": 59858,
        // "open": "",
        // "close": "",
        "lnglat": "-113.332456,46.247940",
        brokerageId: 1,
        ledgerId: 95,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "962 Kernan Rd",
        "address2": "",
        "city": "Oroville",
        "state": "WA",
        "zipcode": 98844,
        // "open": "",
        // "close": "",
        "lnglat": "-119.4414694,48.9377534",
        brokerageId: 1,
        ledgerId: 96,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "222 N Main St",
        "address2": "",
        "city": "Sudan",
        "state": "TX",
        "zipcode": 79371,
        // "open": "",
        // "close": "",
        "lnglat": "-102.519609,34.073020",
        brokerageId: 1,
        ledgerId: 97,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "5001 FM1912",
        "address2": "",
        "city": "Amarillo",
        "state": "TX",
        "zipcode": 79108,
        // "open": "",
        // "close": "",
        "lnglat": "-101.656305,35.257680",
        brokerageId: 1,
        ledgerId: 98,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "303 Co Rd 142",
        "address2": "",
        "city": "Sweetwater",
        "state": "TX",
        "zipcode": 79556,
        // "open": "",
        // "close": "",
        "lnglat": "-100.425521,32.454626",
        brokerageId: 1,
        ledgerId: 99,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "6305 S County Rd 1285",
        "address2": "",
        "city": "Midland",
        "state": "TX",
        "zipcode": 79706,
        // "open": "",
        // "close": "",
        "lnglat": "-102.213661,31.880502",
        brokerageId: 1,
        ledgerId: 100,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        "address": "11613 N, I-27",
        "address2": "",
        "city": "Lubbock",
        "state": "TX",
        "zipcode": 79403,
        // "open": "",
        // "close": "",
        "lnglat": "-101.838864,33.712846",
        brokerageId: 1,
        ledgerId: 101,
        phone: faker.phone.phoneNumber(), createdAt: new Date(),
        updatedAt: new Date()
    }


]

module.exports = locations;