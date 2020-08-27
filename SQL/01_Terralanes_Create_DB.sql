CREATE TABLE customers (
  id serial PRIMARY KEY,
  name VARCHAR (255) NOT NULL,
  industry VARCHAR (255),
  user_id INT NOT NULL
);

CREATE TABLE customer_contacts (
  id serial PRIMARY KEY,
  first_name VARCHAR (255) NOT NULL,
  last_name VARCHAR (255) NOT NULL,
  title VARCHAR (255) NOT NULL,
  phone VARCHAR (255) NOT NULL,
  phone_ext VARCHAR (255),
  email VARCHAR (255) NOT NULL,
  contact_level INT NOT NULL
);

CREATE TABLE teams (
  id serial PRIMARY KEY,
  brokerage_id INT NOT NULL,
  name VARCHAR (255) NOT NULL,
  icon VARCHAR (255)
);

CREATE TABLE lanes (
  id serial PRIMARY KEY,
  customer_location_id INT NOT NULL,
  lane_partner_location_id INT NOT NULL,
  truck_type VARCHAR (255),
  customer_is_shipper boolean NOT NULL
);

CREATE TABLE lane_partners (
  id serial PRIMARY KEY,
  name VARCHAR (255) NOT NULL
);

CREATE TABLE brokerages (
  id serial PRIMARY KEY,
  pin VARCHAR (255) NOT NULL,
  name VARCHAR (255) NOT NULL,
  address VARCHAR (255) NOT NULL,
  address_2 VARCHAR (255),
  city VARCHAR (255) NOT NULL,
  state VARCHAR (255) NOT NULL,
  zipcode VARCHAR (255) NOT NULL,
  phone VARCHAR (255) NOT NULL
);

CREATE TABLE users (
  id serial PRIMARY KEY,
  username VARCHAR (255) NOT NULL,
  brokerage_id INT NOT NULL,
  team_id INT,
  title VARCHAR (255) NOT NULL,
  email VARCHAR (255) NOT NULL,
  first_name VARCHAR (255) NOT NULL,
  last_name VARCHAR (255) NOT NULL,
  phone VARCHAR (255) NOT NULL
);

CREATE TABLE lane_partner_contacts (
  id serial PRIMARY KEY,
  first_name VARCHAR (255) NOT NULL,
  last_name VARCHAR (255) NOT NULL,
  title VARCHAR (255) NOT NULL,
  phone VARCHAR (255) NOT NULL,
  phone_ext VARCHAR (255),
  email VARCHAR (255) NOT NULL
);

CREATE TABLE customer_locations (
  id serial PRIMARY KEY,
  customer_id INT NOT NULL,
  contact_id INT NOT NULL,
  address VARCHAR (255) NOT NULL,
  address_2 VARCHAR (255),
  city VARCHAR (255) NOT NULL,
  state VARCHAR (255) NOT NULL,
  zipcode VARCHAR (255) NOT NULL,
  is_hq boolean NOT NULL,
  is_shipping_recieving boolean NOT NULL
);

CREATE TABLE lane_partner_locations (
  id serial PRIMARY KEY,
  lane_partner_id INT NOT NULL,
  contact_id INT NOT NULL,
  address VARCHAR (255) NOT NULL,
  address_2 VARCHAR (255),
  city VARCHAR (255) NOT NULL,
  state VARCHAR (255) NOT NULL,
  zipcode VARCHAR (255) NOT NULL
);

ALTER TABLE users ADD FOREIGN KEY (brokerage_id) REFERENCES brokerages (id);


ALTER TABLE teams ADD FOREIGN KEY (brokerage_id) REFERENCES brokerages (id);


ALTER TABLE users ADD FOREIGN KEY (team_id) REFERENCES teams (id);


ALTER TABLE customers ADD FOREIGN KEY (user_id) REFERENCES users (id);


ALTER TABLE customer_locations ADD FOREIGN KEY (customer_id) REFERENCES customers (id);


ALTER TABLE customer_locations ADD FOREIGN KEY (contact_id) REFERENCES customer_contacts (id);


ALTER TABLE lane_partner_locations ADD FOREIGN KEY (contact_id) REFERENCES lane_partner_contacts (id);


ALTER TABLE lanes ADD FOREIGN KEY (customer_location_id) REFERENCES customer_locations (id);


ALTER TABLE lanes ADD FOREIGN KEY (lane_partner_location_id) REFERENCES lane_partner_locations (id);


ALTER TABLE lane_partner_locations ADD FOREIGN KEY (lane_partner_id) REFERENCES lane_partners (id);
