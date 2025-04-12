CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE "User"(
    id SERIAL PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    phoneNumber CHAR(10) NOT NULL,
    mail VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    photo VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    isSuperAdmin BOOLEAN NOT NULL,
    newsletter BOOLEAN NOT NULL,
    prefferedNotifMethod VARCHAR(255) NOT NULL
);

CREATE TABLE "User_stripe"(
    id SERIAL PRIMARY KEY,
    iban VARCHAR(255) NOT NULL,
    userId INT NOT NULL,
    CONSTRAINT fk_userId FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Table Tag
CREATE TABLE "Tag" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(255) NOT NULL
);

CREATE TABLE "Event" (
    id SERIAL PRIMARY KEY,
    createdBy INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    dateStart TIMESTAMP NOT NULL,
    dateEnd TIMESTAMP NOT NULL,
    tagId INT,
    min INT,
    max INT,
    photo VARCHAR(255),
    addressStart VARCHAR(255) NOT NULL,
    addressEnd VARCHAR(255) NOT NULL,
    CONSTRAINT fk_createdBy FOREIGN KEY (createdBy) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT fk_tagId FOREIGN KEY (tagId) REFERENCES "Tag"(id) ON DELETE SET NULL
);

CREATE TABLE "Event_registration"(
    id SERIAL PRIMARY KEY,
    userId INT NOT NULL,
    eventId INT NOT NULL,
    CONSTRAINT fk_userId FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT fk_eventId FOREIGN KEY (eventId) REFERENCES "Event"(id) ON DELETE CASCADE
);


-- Table Group
CREATE TABLE "Group" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tagId INT,
    isPrivate BOOLEAN NOT NULL,
    description TEXT,
    CONSTRAINT fk_tag FOREIGN KEY (tagId) REFERENCES "Tag"(id) ON DELETE SET NULL
);

CREATE TABLE "Group_tags" (
    id SERIAL PRIMARY KEY,
    groupId INT NOT NULL,
    tagId INT NOT NULL,
    CONSTRAINT fk_group FOREIGN KEY (groupId) REFERENCES "Group"(id) ON DELETE CASCADE,
    CONSTRAINT fk_tag FOREIGN KEY (tagId) REFERENCES "Tag"(id) ON DELETE CASCADE
);

-- Table Group_membership
CREATE TABLE "Group_membership" (
    id SERIAL PRIMARY KEY,
    userId INT NOT NULL,
    groupId INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT fk_group FOREIGN KEY (groupId) REFERENCES "Group"(id) ON DELETE CASCADE
);

-- Table Group_Message
CREATE TABLE "Group_Message" (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    userId INT NOT NULL,
    groupId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT fk_group FOREIGN KEY (groupId) REFERENCES "Group"(id) ON DELETE CASCADE
);

-- Table Ticket
CREATE TABLE "Ticket" (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    userId INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    creationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Table Ticket_Message
CREATE TABLE "Ticket_Message" (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    senderId INT NOT NULL,
    ticketId INT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('user', 'admin', 'system')),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sender FOREIGN KEY (senderId) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT fk_ticket FOREIGN KEY (ticketId) REFERENCES "Ticket"(id) ON DELETE CASCADE
);

-- Table Neighborhood
CREATE TABLE "neighborhood" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    coordonnees_geo GEOMETRY(Geometry, 4326) NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    creationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Neighborhood_User
CREATE TABLE "neighborhood_user" (
    id SERIAL PRIMARY KEY,
    neighborhoodId INT NOT NULL,
    userId INT NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    CONSTRAINT fk_neighborhood FOREIGN KEY (neighborhoodId) REFERENCES "neighborhood"(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Table Material
CREATE TABLE "Material" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    ownerId INT NOT NULL,
    CONSTRAINT fk_owner FOREIGN KEY (ownerId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Table Material_photos
CREATE TABLE "Material_photos" (
    id SERIAL PRIMARY KEY,
    materialId INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    isPrimary BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_material FOREIGN KEY (materialId) REFERENCES "Material"(id) ON DELETE CASCADE
);

-- Table Sales
CREATE TABLE "Sales" (
    id SERIAL PRIMARY KEY,
    neighborhood_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    userId INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    materialId INT NOT NULL,
    paymentType VARCHAR(50) NOT NULL,
    CONSTRAINT fk_neighborhood FOREIGN KEY (neighborhood_id) REFERENCES "neighborhood"(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT fk_material FOREIGN KEY (materialId) REFERENCES "Material"(id) ON DELETE CASCADE
);

-- Table Loan
CREATE TABLE "Loan" (
    id SERIAL PRIMARY KEY,
    materialId INT NOT NULL,
    neighborhood_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    CONSTRAINT fk_material FOREIGN KEY (materialId) REFERENCES "Material"(id) ON DELETE CASCADE,
    CONSTRAINT fk_neighborhood FOREIGN KEY (neighborhood_id) REFERENCES "neighborhood"(id) ON DELETE CASCADE
);

-- Table Loan_history
CREATE TABLE "Loan_history" (
    id SERIAL PRIMARY KEY,
    loanId INT NOT NULL,
    startDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    endDate TIMESTAMP,
    loanedUserId INT NOT NULL,
    CONSTRAINT fk_loan FOREIGN KEY (loanId) REFERENCES "Loan"(id) ON DELETE CASCADE,
    CONSTRAINT fk_loanedUser FOREIGN KEY (loanedUserId) REFERENCES "User"(id) ON DELETE CASCADE
);
