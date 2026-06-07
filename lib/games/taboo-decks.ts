import type { TabooDeck } from "./types";

// Desi Taboo decks — describe the target without saying any banned word.
// Expandable: add cards or whole decks freely.
export const TABOO_DECKS: TabooDeck[] = [
  {
    key: "bollywood",
    name: "Bollywood",
    cards: [
      {
        id: "tb_bolly_1",
        target: "Shah Rukh Khan",
        banned: ["Actor", "King", "Khan", "DDLJ", "Romance"],
      },
      {
        id: "tb_bolly_2",
        target: "Sholay",
        banned: ["Gabbar", "Classic", "Amitabh", "Dacoit", "Movie"],
      },
      {
        id: "tb_bolly_3",
        target: "Item Song",
        banned: ["Dance", "Heroine", "Party", "Beat", "Movie"],
      },
      {
        id: "tb_bolly_4",
        target: "Amitabh Bachchan",
        banned: ["Big B", "KBC", "Actor", "Voice", "Sholay"],
      },
      {
        id: "tb_bolly_5",
        target: "Salman Khan",
        banned: ["Bhai", "Tiger", "Actor", "Shirt", "Khan"],
      },
      {
        id: "tb_bolly_6",
        target: "Filmfare",
        banned: ["Award", "Black Lady", "Movie", "Trophy", "Best"],
      },
      {
        id: "tb_bolly_7",
        target: "Yash Raj",
        banned: ["Banner", "Studio", "Films", "DDLJ", "Aditya"],
      },
      {
        id: "tb_bolly_8",
        target: "Dialogue",
        banned: ["Line", "Speak", "Famous", "Movie", "Punch"],
      },
      {
        id: "tb_bolly_9",
        target: "Deepika Padukone",
        banned: ["Actress", "Ranveer", "Padmaavat", "Heroine", "Tall"],
      },
      {
        id: "tb_bolly_10",
        target: "Interval",
        banned: ["Break", "Half", "Movie", "Theatre", "Popcorn"],
      },
      {
        id: "tb_bolly_11",
        target: "Item Number",
        banned: ["Song", "Dance", "Special", "Beat", "Girl"],
      },
      {
        id: "tb_bolly_12",
        target: "Mughal-e-Azam",
        banned: ["Akbar", "Anarkali", "Classic", "King", "Old"],
      },
    ],
  },
  {
    key: "cricket",
    name: "Cricket",
    cards: [
      {
        id: "tb_crk_1",
        target: "Virat Kohli",
        banned: ["Batsman", "RCB", "India", "Captain", "Anushka"],
      },
      {
        id: "tb_crk_2",
        target: "IPL",
        banned: ["Cricket", "League", "Auction", "Teams", "Twenty20"],
      },
      {
        id: "tb_crk_3",
        target: "Sixer",
        banned: ["Six", "Run", "Boundary", "Bat", "Hit"],
      },
      {
        id: "tb_crk_4",
        target: "MS Dhoni",
        banned: ["Captain", "Wicketkeeper", "Helicopter", "CSK", "Ranchi"],
      },
      {
        id: "tb_crk_5",
        target: "Sachin Tendulkar",
        banned: ["God", "Master", "Batsman", "100", "Mumbai"],
      },
      {
        id: "tb_crk_6",
        target: "Yorker",
        banned: ["Ball", "Bowler", "Toe", "Fast", "Stumps"],
      },
      {
        id: "tb_crk_7",
        target: "World Cup",
        banned: ["Trophy", "Tournament", "2011", "Final", "Win"],
      },
      {
        id: "tb_crk_8",
        target: "LBW",
        banned: ["Leg", "Out", "Umpire", "Pad", "Wicket"],
      },
      {
        id: "tb_crk_9",
        target: "Wankhede",
        banned: ["Stadium", "Mumbai", "Ground", "Match", "Sea"],
      },
      {
        id: "tb_crk_10",
        target: "Duck",
        banned: ["Zero", "Out", "Score", "Batsman", "Run"],
      },
      {
        id: "tb_crk_11",
        target: "Gully Cricket",
        banned: ["Street", "Tennis", "Ball", "Tape", "Kids"],
      },
      {
        id: "tb_crk_12",
        target: "Rohit Sharma",
        banned: ["Hitman", "Captain", "Opener", "Mumbai", "Double"],
      },
    ],
  },
  {
    key: "street_food",
    name: "Street Food",
    cards: [
      {
        id: "tb_food_1",
        target: "Pani Puri",
        banned: ["Golgappa", "Water", "Snack", "Spicy", "Puri"],
      },
      {
        id: "tb_food_2",
        target: "Vada Pav",
        banned: ["Mumbai", "Burger", "Potato", "Bread", "Batata"],
      },
      {
        id: "tb_food_3",
        target: "Chai",
        banned: ["Tea", "Milk", "Cutting", "Tapri", "Morning"],
      },
      {
        id: "tb_food_4",
        target: "Dosa",
        banned: ["South", "Crispy", "Sambar", "Rice", "Chutney"],
      },
      {
        id: "tb_food_5",
        target: "Samosa",
        banned: ["Triangle", "Potato", "Fried", "Snack", "Chutney"],
      },
      {
        id: "tb_food_6",
        target: "Chole Bhature",
        banned: ["Punjabi", "Chickpea", "Fried", "Delhi", "Bread"],
      },
      {
        id: "tb_food_7",
        target: "Pav Bhaji",
        banned: ["Mumbai", "Butter", "Mash", "Bread", "Veg"],
      },
      {
        id: "tb_food_8",
        target: "Jalebi",
        banned: ["Sweet", "Orange", "Syrup", "Spiral", "Fried"],
      },
      {
        id: "tb_food_9",
        target: "Momos",
        banned: ["Dumpling", "Steam", "Chutney", "Tibet", "Veg"],
      },
      {
        id: "tb_food_10",
        target: "Biryani",
        banned: ["Rice", "Hyderabad", "Dum", "Chicken", "Masala"],
      },
      {
        id: "tb_food_11",
        target: "Lassi",
        banned: ["Curd", "Punjab", "Sweet", "Glass", "Drink"],
      },
      {
        id: "tb_food_12",
        target: "Kulfi",
        banned: ["Ice Cream", "Cold", "Stick", "Milk", "Sweet"],
      },
    ],
  },
  {
    key: "shaadi",
    name: "Shaadi",
    cards: [
      {
        id: "tb_shaadi_1",
        target: "Sangeet",
        banned: ["Dance", "Music", "Function", "Songs", "Night"],
      },
      {
        id: "tb_shaadi_2",
        target: "Baraat",
        banned: ["Groom", "Horse", "Procession", "Band", "Dance"],
      },
      {
        id: "tb_shaadi_3",
        target: "Mehendi",
        banned: ["Henna", "Hands", "Bride", "Design", "Green"],
      },
      {
        id: "tb_shaadi_4",
        target: "Pheras",
        banned: ["Fire", "Rounds", "Seven", "Priest", "Vows"],
      },
      {
        id: "tb_shaadi_5",
        target: "Vidaai",
        banned: ["Bride", "Leave", "Cry", "Rice", "Farewell"],
      },
      {
        id: "tb_shaadi_6",
        target: "Dowry",
        banned: ["Money", "Gift", "Bride", "Illegal", "Demand"],
      },
      {
        id: "tb_shaadi_7",
        target: "Saat Phere",
        banned: ["Seven", "Rounds", "Fire", "Marriage", "Vows"],
      },
      {
        id: "tb_shaadi_8",
        target: "Shagun",
        banned: ["Gift", "Money", "Envelope", "Blessing", "Lucky"],
      },
      {
        id: "tb_shaadi_9",
        target: "Pandit",
        banned: ["Priest", "Mantra", "Hindu", "Ritual", "Fire"],
      },
      {
        id: "tb_shaadi_10",
        target: "Joota Chupai",
        banned: ["Shoe", "Hide", "Groom", "Money", "Sisters"],
      },
    ],
  },
  {
    key: "brands",
    name: "Indian Brands",
    cards: [
      {
        id: "tb_brand_1",
        target: "Amul",
        banned: ["Butter", "Milk", "Girl", "Dairy", "Cheese"],
      },
      {
        id: "tb_brand_2",
        target: "Maggi",
        banned: ["Noodles", "2-minute", "Masala", "Nestle", "Snack"],
      },
      {
        id: "tb_brand_3",
        target: "Paytm",
        banned: ["Payment", "UPI", "Wallet", "QR", "Money"],
      },
      {
        id: "tb_brand_4",
        target: "Tata",
        banned: ["Group", "Salt", "Car", "Steel", "Ratan"],
      },
      {
        id: "tb_brand_5",
        target: "Fevicol",
        banned: ["Glue", "Stick", "Ad", "Strong", "Bond"],
      },
      {
        id: "tb_brand_6",
        target: "Parle-G",
        banned: ["Biscuit", "Glucose", "Tea", "Baby", "Yellow"],
      },
      {
        id: "tb_brand_7",
        target: "Flipkart",
        banned: ["Online", "Shopping", "Amazon", "Sale", "Delivery"],
      },
      { id: "tb_brand_8", target: "Ola", banned: ["Cab", "Taxi", "Ride", "App", "Uber"] },
      {
        id: "tb_brand_9",
        target: "Zomato",
        banned: ["Food", "Delivery", "App", "Order", "Restaurant"],
      },
      {
        id: "tb_brand_10",
        target: "Boroline",
        banned: ["Cream", "Green", "Skin", "Tube", "Antiseptic"],
      },
    ],
  },
  {
    key: "festivals",
    name: "Festivals",
    cards: [
      {
        id: "tb_fest_1",
        target: "Holi",
        banned: ["Colour", "Water", "Gulaal", "Spring", "Festival"],
      },
      {
        id: "tb_fest_2",
        target: "Diwali",
        banned: ["Lights", "Crackers", "Diya", "Lakshmi", "Festival"],
      },
      {
        id: "tb_fest_3",
        target: "Raksha Bandhan",
        banned: ["Rakhi", "Brother", "Sister", "Thread", "Wrist"],
      },
      {
        id: "tb_fest_4",
        target: "Navratri",
        banned: ["Garba", "Nine", "Nights", "Dance", "Durga"],
      },
      {
        id: "tb_fest_5",
        target: "Ganesh Chaturthi",
        banned: ["Ganpati", "Elephant", "Modak", "Mumbai", "Visarjan"],
      },
      {
        id: "tb_fest_6",
        target: "Eid",
        banned: ["Moon", "Feast", "Muslim", "Sewai", "Namaz"],
      },
      {
        id: "tb_fest_7",
        target: "Karva Chauth",
        banned: ["Fast", "Wife", "Moon", "Husband", "Sieve"],
      },
      {
        id: "tb_fest_8",
        target: "Onam",
        banned: ["Kerala", "Boat", "Sadya", "Flower", "Harvest"],
      },
      {
        id: "tb_fest_9",
        target: "Lohri",
        banned: ["Bonfire", "Punjab", "Winter", "Popcorn", "Dance"],
      },
      {
        id: "tb_fest_10",
        target: "Pongal",
        banned: ["Tamil", "Harvest", "Rice", "Pot", "Sun"],
      },
    ],
  },
  {
    key: "places",
    name: "Cities & Places",
    cards: [
      {
        id: "tb_place_1",
        target: "Goa",
        banned: ["Beach", "Party", "Portuguese", "Vacation", "Susegad"],
      },
      {
        id: "tb_place_2",
        target: "Taj Mahal",
        banned: ["Agra", "Love", "Marble", "White", "Shah Jahan"],
      },
      {
        id: "tb_place_3",
        target: "Mumbai",
        banned: ["Bombay", "Local", "Bollywood", "Sea", "Maharashtra"],
      },
      {
        id: "tb_place_4",
        target: "Delhi",
        banned: ["Capital", "Metro", "India Gate", "North", "Pollution"],
      },
      {
        id: "tb_place_5",
        target: "Jaipur",
        banned: ["Pink", "Rajasthan", "Forts", "Palace", "City"],
      },
      {
        id: "tb_place_6",
        target: "Kerala",
        banned: ["Backwater", "Coconut", "South", "God", "Boat"],
      },
      {
        id: "tb_place_7",
        target: "Ladakh",
        banned: ["Mountain", "Bike", "Cold", "Pangong", "Leh"],
      },
      {
        id: "tb_place_8",
        target: "Varanasi",
        banned: ["Ganga", "Ghat", "Holy", "Banaras", "Aarti"],
      },
      {
        id: "tb_place_9",
        target: "Manali",
        banned: ["Hills", "Snow", "Himachal", "Honeymoon", "Mountain"],
      },
      {
        id: "tb_place_10",
        target: "Rann of Kutch",
        banned: ["Salt", "White", "Gujarat", "Desert", "Festival"],
      },
    ],
  },
];
