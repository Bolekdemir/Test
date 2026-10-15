export interface Topic {
  id: string;
  name: string;
  words: string[];
}

export const TOPICS: Topic[] = [
  {
    id: 'food',
    name: 'Food',
    words: [
      'Pizza', 'Sushi', 'Burger', 'Pancakes', 'Tacos', 'Spaghetti', 'Ice cream', 'Popcorn',
      'Croissant', 'Hot dog', 'Fried chicken', 'Donut', 'Avocado', 'Ramen', 'Kebab', 'Waffles',
      'Cheesecake', 'Nachos', 'Lasagna', 'Burrito', 'French fries', 'Omelette', 'Pretzel',
      'Watermelon', 'Popsicle', 'Chocolate', 'Cereal', 'Dumplings', 'Baklava', 'Mac and cheese',
      'Cupcake', 'Salad', 'Sandwich', 'Steak', 'Peanut butter', 'Honey', 'Cookie', 'Bubble tea',
    ],
  },
  {
    id: 'animals',
    name: 'Animals',
    words: [
      'Penguin', 'Giraffe', 'Shark', 'Kangaroo', 'Octopus', 'Elephant', 'Owl', 'Dolphin',
      'Panda', 'Flamingo', 'Crocodile', 'Bee', 'Sloth', 'Camel', 'Peacock', 'Hamster',
      'Zebra', 'Bat', 'Turtle', 'Jellyfish', 'Wolf', 'Parrot', 'Snail', 'Gorilla',
      'Squirrel', 'Lion', 'Frog', 'Horse', 'Koala', 'Spider', 'Chameleon', 'Polar bear',
      'Raccoon', 'Hedgehog', 'Whale', 'Butterfly', 'Capybara', 'Goat',
    ],
  },
  {
    id: 'games',
    name: 'Video games',
    words: [
      'Minecraft', 'Fortnite', 'Roblox', 'Among Us', 'GTA', 'EA FC', 'Call of Duty', 'Mario Kart',
      'Pokémon', 'Zelda', 'Tetris', 'Pac-Man', 'Valorant', 'League of Legends', 'Clash Royale',
      'Brawl Stars', 'Subway Surfers', 'Candy Crush', 'Rocket League', 'Overwatch', 'The Sims',
      'Animal Crossing', 'Fall Guys', 'Elden Ring', 'Geometry Dash', 'Angry Birds', 'Flappy Bird',
      'Apex Legends', 'Red Dead Redemption', 'Super Smash Bros', 'Sonic', 'Stardew Valley',
      'Hollow Knight', 'Clash of Clans', 'Genshin Impact', 'Five Nights at Freddy’s',
    ],
  },
  {
    id: 'brainrot',
    name: 'Brainrot',
    words: [
      'Skibidi Toilet', 'Rizz', 'Sigma', 'Fanum tax', 'Ohio', 'Mewing', 'Looksmaxxing', 'Aura',
      'NPC', 'Grimace Shake', 'Sus', 'Delulu', 'Mogging', 'Glazing', 'Cap', 'Bussin',
      'Goofy ahh', 'The ick', 'Yapping', 'Tung Tung Tung Sahur', 'Tralalero Tralala',
      'Bombardiro Crocodilo', 'Ballerina Cappuccina', 'Chill guy', 'Baby Gronk', 'Rizzler',
      '6 7', 'Lil bro', 'Ratio', 'Main character', 'Slay', 'Labubu', 'Dubai chocolate',
      'Italian brainrot', 'Gyatt', 'Quandale Dingle', 'Brr Brr Patapim', 'Lirili Larila',
    ],
  },
  {
    id: 'creators',
    name: 'Creators & streamers',
    words: [
      'MrBeast', 'IShowSpeed', 'Kai Cenat', 'PewDiePie', 'Dream', 'Ninja', 'xQc', 'Markiplier',
      'Khaby Lame', 'Logan Paul', 'KSI', 'Sidemen', 'Dude Perfect', 'Pokimane', 'TommyInnit',
      'Technoblade', 'Jynxzi', 'Duke Dennis', 'Charli D’Amelio', 'Addison Rae', 'Emma Chamberlain',
      'Ibai', 'Mark Rober', 'Airrack', 'Adin Ross', 'Corpse Husband', 'Jacksepticeye',
      'Unspeakable', 'Preston', 'Ludwig',
    ],
  },
  {
    id: 'apps',
    name: 'Apps & internet',
    words: [
      'TikTok', 'Instagram', 'Snapchat', 'YouTube', 'WhatsApp', 'Discord', 'Spotify', 'Netflix',
      'Google', 'Wikipedia', 'Twitch', 'Pinterest', 'Reddit', 'Duolingo', 'Uber', 'Amazon',
      'ChatGPT', 'FaceTime', 'Shazam', 'BeReal', 'Google Maps', 'Emoji', 'Meme', 'Wi-Fi',
      'Password', 'Selfie', 'Hashtag', 'Livestream', 'Podcast', 'Airdrop', 'Screenshot', 'Captcha',
    ],
  },
  {
    id: 'movies',
    name: 'Movies',
    words: [
      'Titanic', 'Frozen', 'Star Wars', 'Harry Potter', 'Shrek', 'The Lion King', 'Jurassic Park',
      'Toy Story', 'Avatar', 'Barbie', 'Oppenheimer', 'Finding Nemo', 'Spider-Man', 'Batman',
      'The Avengers', 'Home Alone', 'Minions', 'Cars', 'Top Gun', 'The Matrix', 'Jaws',
      'Inside Out', 'Kung Fu Panda', 'Moana', 'Ratatouille', 'Up', 'Coco', 'Ghostbusters',
      'Back to the Future', 'Pirates of the Caribbean', 'The Hunger Games', 'Twilight',
      'Mean Girls', 'Despicable Me', 'Encanto', 'Dune',
    ],
  },
  {
    id: 'shows',
    name: 'TV & cartoons',
    words: [
      'SpongeBob', 'The Simpsons', 'Stranger Things', 'Squid Game', 'Wednesday', 'Friends',
      'Breaking Bad', 'Peppa Pig', 'Family Guy', 'Rick and Morty', 'Bluey', 'Phineas and Ferb',
      'Ben 10', 'Scooby-Doo', 'Tom and Jerry', 'Gravity Falls', 'Adventure Time', 'The Office',
      'Game of Thrones', 'Naruto', 'One Piece', 'Dragon Ball', 'Demon Slayer', 'Attack on Titan',
      'Pokémon anime', 'Paw Patrol', 'Mr. Bean', 'Avatar: The Last Airbender', 'Shark Tank',
      'Love Island', 'The Amazing Digital Circus', 'Arcane',
    ],
  },
  {
    id: 'music',
    name: 'Music',
    words: [
      'Taylor Swift', 'Drake', 'Billie Eilish', 'Ed Sheeran', 'Ariana Grande', 'The Weeknd',
      'Bad Bunny', 'BTS', 'BLACKPINK', 'Eminem', 'Beyoncé', 'Rihanna', 'Michael Jackson',
      'Justin Bieber', 'Olivia Rodrigo', 'Sabrina Carpenter', 'Travis Scott', 'Doja Cat',
      'Bruno Mars', 'Dua Lipa', 'Kanye West', 'Lady Gaga', 'Harry Styles', 'Coldplay',
      'Imagine Dragons', 'Queen', 'The Beatles', 'Post Malone', 'SZA', 'Chappell Roan',
      'Kendrick Lamar', 'Shakira',
    ],
  },
  {
    id: 'instruments',
    name: 'Instruments',
    words: [
      'Guitar', 'Piano', 'Drums', 'Violin', 'Trumpet', 'Saxophone', 'Flute', 'Harp', 'Cello',
      'Ukulele', 'Accordion', 'Harmonica', 'Xylophone', 'Tambourine', 'Bagpipes', 'Banjo',
      'Triangle', 'Microphone', 'DJ decks', 'Bass guitar', 'Tuba', 'Clarinet', 'Recorder',
      'Bongos', 'Keytar', 'Cowbell',
    ],
  },
  {
    id: 'sports',
    name: 'Sports',
    words: [
      'Football', 'Basketball', 'Tennis', 'Swimming', 'Boxing', 'Golf', 'Skateboarding', 'Surfing',
      'Volleyball', 'Baseball', 'Ice hockey', 'Formula 1', 'Cycling', 'Karate', 'Skiing',
      'Wrestling', 'Bowling', 'Table tennis', 'Rugby', 'Gymnastics', 'Archery', 'Fencing',
      'Snowboarding', 'Marathon', 'Climbing', 'Badminton', 'Darts', 'Cricket', 'Sumo', 'Parkour',
    ],
  },
  {
    id: 'athletes',
    name: 'Athletes',
    words: [
      'Messi', 'Ronaldo', 'Neymar', 'Mbappé', 'Haaland', 'LeBron James', 'Stephen Curry',
      'Michael Jordan', 'Serena Williams', 'Usain Bolt', 'Lewis Hamilton', 'Max Verstappen',
      'Simone Biles', 'Tiger Woods', 'Roger Federer', 'Rafael Nadal', 'Muhammad Ali',
      'Conor McGregor', 'Tom Brady', 'Michael Phelps', 'Kobe Bryant', 'Zlatan', 'Mike Tyson',
      'Shaquille O’Neal', 'Novak Djokovic', 'Vinicius Jr', 'Bellingham', 'Victor Wembanyama',
    ],
  },
  {
    id: 'superheroes',
    name: 'Heroes & villains',
    words: [
      'Spider-Man', 'Batman', 'Superman', 'Iron Man', 'Hulk', 'Thor', 'Wonder Woman', 'Joker',
      'Thanos', 'Deadpool', 'Black Panther', 'Captain America', 'Wolverine', 'The Flash',
      'Darth Vader', 'Voldemort', 'Venom', 'Loki', 'Groot', 'Aquaman', 'Catwoman', 'Harley Quinn',
      'Doctor Strange', 'Scarlet Witch', 'Black Widow', 'Ant-Man', 'Shazam', 'Green Lantern',
      'Magneto', 'Gru',
    ],
  },
  {
    id: 'places',
    name: 'Places',
    words: [
      'Beach', 'Airport', 'Hospital', 'Library', 'Cinema', 'Gym', 'Zoo', 'Museum', 'Supermarket',
      'Train station', 'Theme park', 'Camping site', 'Prison', 'Casino', 'Castle', 'Desert',
      'Jungle', 'Space station', 'Submarine', 'Hotel', 'Bakery', 'Restaurant', 'Stadium',
      'Church', 'Farm', 'Ski resort', 'Aquarium', 'Volcano', 'Island', 'Cruise ship',
      'Bowling alley', 'Car wash', 'Hair salon', 'Fire station',
    ],
  },
  {
    id: 'countries',
    name: 'Countries & cities',
    words: [
      'Japan', 'Brazil', 'Egypt', 'Italy', 'Australia', 'Mexico', 'Canada', 'India', 'France',
      'Turkey', 'China', 'Greece', 'Norway', 'Spain', 'Germany', 'United States', 'England',
      'Netherlands', 'South Korea', 'Jamaica', 'Iceland', 'Paris', 'New York', 'London',
      'Tokyo', 'Dubai', 'Istanbul', 'Rome', 'Las Vegas', 'Hollywood', 'Venice', 'Amsterdam',
    ],
  },
  {
    id: 'landmarks',
    name: 'Landmarks',
    words: [
      'Eiffel Tower', 'Statue of Liberty', 'Great Wall of China', 'Pyramids', 'Big Ben',
      'Colosseum', 'Taj Mahal', 'Mount Everest', 'Niagara Falls', 'Stonehenge', 'Golden Gate Bridge',
      'Leaning Tower of Pisa', 'Machu Picchu', 'Burj Khalifa', 'Hagia Sophia', 'Sydney Opera House',
      'Grand Canyon', 'Mount Rushmore', 'Christ the Redeemer', 'Times Square', 'Disneyland',
      'Hollywood sign', 'Buckingham Palace', 'Area 51', 'The White House', 'Northern Lights',
    ],
  },
  {
    id: 'jobs',
    name: 'Jobs',
    words: [
      'Doctor', 'Teacher', 'Firefighter', 'Pilot', 'Chef', 'Police officer', 'Astronaut',
      'Dentist', 'Farmer', 'Lawyer', 'Plumber', 'Hairdresser', 'Photographer', 'Lifeguard',
      'Magician', 'Clown', 'Detective', 'Scientist', 'Mechanic', 'Waiter', 'Architect',
      'Judge', 'Nurse', 'DJ', 'Influencer', 'Soldier', 'Vet', 'Baker', 'Builder', 'Spy',
      'Taxi driver', 'Referee',
    ],
  },
  {
    id: 'home',
    name: 'Around the house',
    words: [
      'Toothbrush', 'Pillow', 'Microwave', 'Fridge', 'Mirror', 'Sofa', 'Remote control',
      'Toilet paper', 'Lamp', 'Umbrella', 'Washing machine', 'Vacuum cleaner', 'Candle',
      'Alarm clock', 'Frying pan', 'Doormat', 'Curtains', 'Bathtub', 'Scissors', 'Hairdryer',
      'Bookshelf', 'Blanket', 'Kettle', 'Toaster', 'Fork', 'Plant pot', 'Ladder', 'Key',
      'Light bulb', 'Charger', 'Bunk bed', 'Trash can',
    ],
  },
  {
    id: 'school',
    name: 'School',
    words: [
      'Homework', 'Detention', 'Calculator', 'Backpack', 'Principal', 'Exam', 'Lunch break',
      'Chalkboard', 'Pencil case', 'Report card', 'Gym class', 'School bus', 'Locker', 'Eraser',
      'Field trip', 'Science lab', 'Graduation', 'Ruler', 'Cafeteria', 'Recess', 'Group project',
      'Substitute teacher', 'Fire drill', 'Prom', 'Yearbook', 'Spelling test', 'Glue stick',
      'Class clown',
    ],
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    words: [
      'Bicycle', 'Helicopter', 'Submarine', 'Skateboard', 'Tractor', 'Ambulance', 'Rocket',
      'Hot air balloon', 'Scooter', 'Motorbike', 'Train', 'Sailboat', 'Fire truck', 'Limousine',
      'Bulldozer', 'Jet ski', 'Tank', 'Taxi', 'Police car', 'Cable car', 'Canoe', 'Monster truck',
      'Ice cream truck', 'Tesla', 'Lamborghini', 'Golf cart', 'Segway', 'Roller coaster',
    ],
  },
  {
    id: 'brands',
    name: 'Brands',
    words: [
      'Nike', 'Adidas', 'Apple', 'Samsung', 'McDonald’s', 'Coca-Cola', 'Starbucks', 'LEGO',
      'IKEA', 'Gucci', 'Ferrari', 'PlayStation', 'Xbox', 'Nintendo', 'Red Bull', 'KFC',
      'Disney', 'Louis Vuitton', 'Tesla', 'Burger King', 'Supreme', 'Crocs', 'Prime', 'Stanley cup',
      'Nutella', 'Pepsi', 'Domino’s', 'Rolex', 'Chanel', 'Converse',
    ],
  },
  {
    id: 'clothing',
    name: 'Clothes & style',
    words: [
      'Hoodie', 'Sneakers', 'Sunglasses', 'Hat', 'Scarf', 'Jeans', 'Pajamas', 'Bow tie',
      'High heels', 'Swimsuit', 'Raincoat', 'Backpack', 'Earrings', 'Watch', 'Sweatpants',
      'Crown', 'Socks', 'Gloves', 'Wedding dress', 'Tuxedo', 'Flip-flops', 'Beanie', 'Braces',
      'Tattoo', 'Nail polish', 'Wig', 'Cowboy boots', 'Bucket hat',
    ],
  },
  {
    id: 'nature',
    name: 'Nature & weather',
    words: [
      'Rainbow', 'Thunderstorm', 'Waterfall', 'Volcano', 'Tornado', 'Snowman', 'Sunset', 'Cactus',
      'Earthquake', 'Mountain', 'Lightning', 'Iceberg', 'Forest', 'Cave', 'Moon', 'Ocean',
      'Sand dune', 'Fog', 'Hail', 'Sunflower', 'Palm tree', 'Mushroom', 'Comet', 'Eclipse',
      'Glacier', 'River', 'Rose', 'Tsunami',
    ],
  },
  {
    id: 'holidays',
    name: 'Holidays & parties',
    words: [
      'Christmas', 'Halloween', 'Birthday', 'New Year’s Eve', 'Easter', 'Valentine’s Day',
      'Wedding', 'Fireworks', 'Santa Claus', 'Piñata', 'Sleepover', 'Barbecue', 'Road trip',
      'Costume party', 'Graduation party', 'Baby shower', 'Karaoke', 'Concert', 'Festival',
      'Thanksgiving', 'Trick or treat', 'Advent calendar', 'Surprise party', 'Gender reveal',
      'Ramadan', 'Snowball fight', 'Escape room', 'Bonfire',
    ],
  },
  {
    id: 'fantasy',
    name: 'Fantasy & myths',
    words: [
      'Dragon', 'Unicorn', 'Vampire', 'Zombie', 'Mermaid', 'Wizard', 'Ghost', 'Werewolf',
      'Alien', 'Fairy', 'Pirate', 'Ninja', 'Robot', 'Knight', 'Witch', 'Mummy', 'Bigfoot',
      'Genie', 'Phoenix', 'Elf', 'Goblin', 'Troll', 'Cyclops', 'Medusa', 'Time machine',
      'Magic wand', 'Haunted house', 'Treasure chest',
    ],
  },
  {
    id: 'board',
    name: 'Board & party games',
    words: [
      'Monopoly', 'Chess', 'Uno', 'Jenga', 'Twister', 'Scrabble', 'Poker', 'Hide and seek',
      'Truth or dare', 'Tag', 'Rock paper scissors', 'Charades', 'Cluedo', 'Connect Four',
      'Battleship', 'Bingo', 'Dominoes', 'Musical chairs', 'Pictionary', 'Simon says',
      'Spin the bottle', 'Hangman', 'Tic-tac-toe', 'Werewolf', 'Exploding Kittens', 'Cornhole',
      'Never have I ever', 'Red light green light',
    ],
  },
];

export const TOPIC_BY_ID: Record<string, Topic> = Object.fromEntries(
  TOPICS.map((t) => [t.id, t]),
);

export const ALL_TOPIC_IDS = TOPICS.map((t) => t.id);
