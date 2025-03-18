CREATE DATABASE voisin_comme_cochon;

\c voisin_comme_cochon;

CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "postgis_topology";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE user{
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    prefferedNotifMethod VARCHAR(255) NOT NULL,
}

CREATE TABLE user-stripe{
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    iban VARCHAR(255) NOT NULL,
    userId UUID NOT NULL,
}

CREATE TABLE event-registration{
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL,
    eventId UUID NOT NULL,
}

CREATE TABLE event (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    createdBy UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    dateStart TIMESTAMP NOT NULL,
    dateEnd TIMESTAMP NOT NULL,
    tagId UUID,
    min INT,
    max INT,
    photo VARCHAR(255),
    addressStart VARCHAR(255) NOT NULL,
    addressEnd VARCHAR(255) NOT NULL,
    CONSTRAINT fk_createdBy FOREIGN KEY (createdBy) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT fk_tagId FOREIGN KEY (tagId) REFERENCES "Tag"(id) ON DELETE SET NULL
);

-- Table Tag
CREATE TABLE "Tag" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    color VARCHAR(255) NOT NULL
);

-- Table Group
CREATE TABLE "Group" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    tagId UUID[],
    isPrivate BOOLEAN NOT NULL,
    description TEXT,
    CONSTRAINT fk_tag FOREIGN KEY (tagId) REFERENCES "Tag"(id) ON DELETE SET NULL
);

-- Table Group_membership
CREATE TABLE "Group_membership" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL,
    groupId UUID NOT NULL,
    status VARCHAR(50) NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT fk_group FOREIGN KEY (groupId) REFERENCES "Group"(id) ON DELETE CASCADE
);

-- Table Group_Message
CREATE TABLE "Group_Message" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    userId UUID NOT NULL,
    groupId UUID NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT fk_group FOREIGN KEY (groupId) REFERENCES "Group"(id) ON DELETE CASCADE
);

-- Table Ticket
CREATE TABLE "Ticket" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject VARCHAR(255) NOT NULL,
    userId UUID NOT NULL,
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    creationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Table Ticket_Message
CREATE TABLE "Ticket_Message" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    senderId UUID NOT NULL,
    ticketId UUID NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('user', 'admin', 'system')),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sender FOREIGN KEY (senderId) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT fk_ticket FOREIGN KEY (ticketId) REFERENCES "Ticket"(id) ON DELETE CASCADE
);

-- Table Neighborhood
CREATE TABLE "neighborhood" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    coordonnees_geo GEOMETRY(Geometry, 4326) NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    creationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Neighborhood_User
CREATE TABLE "neighborhood_user" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    neighborhoodId UUID NOT NULL,
    userId UUID NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    CONSTRAINT fk_neighborhood FOREIGN KEY (neighborhoodId) REFERENCES "neighborhood"(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Table Material
CREATE TABLE "Material" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    ownerId UUID NOT NULL,
    CONSTRAINT fk_owner FOREIGN KEY (ownerId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Table Material_photos
CREATE TABLE "Material_photos" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    materialId UUID NOT NULL,
    url VARCHAR(255) NOT NULL,
    isPrimary BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_material FOREIGN KEY (materialId) REFERENCES "Material"(id) ON DELETE CASCADE
);

-- Table Sales
CREATE TABLE "Sales" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    neighborhood_id UUID NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    userId UUID NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    materialId UUID NOT NULL,
    paymentType VARCHAR(50) NOT NULL CHECK,
    CONSTRAINT fk_neighborhood FOREIGN KEY (neighborhood_id) REFERENCES "neighborhood"(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT fk_material FOREIGN KEY (materialId) REFERENCES "Material"(id) ON DELETE CASCADE
);

-- Table Loan
CREATE TABLE "Loan" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    materialId UUID NOT NULL,
    neighborhood_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL,
    CONSTRAINT fk_material FOREIGN KEY (materialId) REFERENCES "Material"(id) ON DELETE CASCADE,
    CONSTRAINT fk_neighborhood FOREIGN KEY (neighborhood_id) REFERENCES "neighborhood"(id) ON DELETE CASCADE
);

-- Table Loan_history
CREATE TABLE "Loan_history" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loanId UUID NOT NULL,
    startDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    endDate TIMESTAMP,
    loanedUserId UUID NOT NULL,
    CONSTRAINT fk_loan FOREIGN KEY (loanId) REFERENCES "Loan"(id) ON DELETE CASCADE,
    CONSTRAINT fk_loanedUser FOREIGN KEY (loanedUserId) REFERENCES "User"(id) ON DELETE CASCADE
);
