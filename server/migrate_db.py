from sqlalchemy import text
from app.db import engine

def migrate_database():
    """Drop the data column from uploaded_files table since we're using file system storage."""
    
    print("Starting database migration...")
    
    with engine.connect() as conn:
        # Check if data column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'uploaded_files' 
            AND column_name = 'data'
        """))
        
        column_exists = result.fetchone()
        print(f"Data column exists check result: {column_exists}")
        
        if column_exists:
            print("Dropping data column from uploaded_files table...")
            
            # Drop the data column
            conn.execute(text("""
                ALTER TABLE uploaded_files 
                DROP COLUMN data
            """))
            
            conn.commit()
            print("✅ data column dropped successfully!")
        else:
            print("✅ data column already removed!")

    with engine.connect() as conn:
        # Check if processed_at column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'processed_statements' 
            AND column_name = 'processed_at'
        """))
        
        column_exists = result.fetchone()
        print(f"Processed_at column exists check result: {column_exists}")
        
        if not column_exists:
            print("Adding processed_at column to processed_statements table...")
            
            # Add processed_at column
            conn.execute(text("""
                ALTER TABLE processed_statements 
                ADD COLUMN processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            """))
            
            conn.commit()
            print("✅ processed_at column added successfully!")
        else:
            print("✅ processed_at column already exists!")

if __name__ == "__main__":
    migrate_database() 