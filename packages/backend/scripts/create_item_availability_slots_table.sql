-- Migration: Create item_availability_slots table
-- This table manages partial reservations within availability periods

-- Create the enum for item availability slot status
DO $$ BEGIN
    CREATE TYPE item_availability_slot_status_enum AS ENUM ('available', 'reserved', 'occupied');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the item_availability_slots table
CREATE TABLE IF NOT EXISTS item_availability_slots (
    id SERIAL PRIMARY KEY,
    availability_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status item_availability_slot_status_enum NOT NULL DEFAULT 'available',
    loan_request_id INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_item_availability_slots_availability 
        FOREIGN KEY (availability_id) 
        REFERENCES item_availabilities(id) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_item_availability_slots_loan_request 
        FOREIGN KEY (loan_request_id) 
        REFERENCES loan_requests(id) 
        ON DELETE CASCADE,
    
    -- Constraints to ensure data integrity
    CONSTRAINT chk_item_availability_slots_dates 
        CHECK (start_date <= end_date),
        
    -- Index for performance
    CONSTRAINT idx_item_availability_slots_availability_dates 
        UNIQUE (availability_id, start_date, end_date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_item_availability_slots_availability_id 
    ON item_availability_slots(availability_id);
    
CREATE INDEX IF NOT EXISTS idx_item_availability_slots_loan_request_id 
    ON item_availability_slots(loan_request_id);
    
CREATE INDEX IF NOT EXISTS idx_item_availability_slots_status 
    ON item_availability_slots(status);
    
CREATE INDEX IF NOT EXISTS idx_item_availability_slots_dates 
    ON item_availability_slots(start_date, end_date);

-- Add comments for documentation
COMMENT ON TABLE item_availability_slots IS 'Stores partial reservations within item availability periods';
COMMENT ON COLUMN item_availability_slots.availability_id IS 'References the parent availability period';
COMMENT ON COLUMN item_availability_slots.start_date IS 'Start date of the partial reservation';
COMMENT ON COLUMN item_availability_slots.end_date IS 'End date of the partial reservation';
COMMENT ON COLUMN item_availability_slots.status IS 'Status of the slot: available, reserved, or occupied';
COMMENT ON COLUMN item_availability_slots.loan_request_id IS 'References the loan request that created this slot';