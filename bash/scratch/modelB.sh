#!/bin/bash

# Set the database connection variables
DB_HOST="127.0.0.1"
DB_PORT="3308"
DB_USER="root"
DB_PASSWORD="test"
DB_NAME="insurance"

# Set the output file
OUTPUT_FILE="db_stats.info"

# Write the header information to the output file
echo "======================================" >> $OUTPUT_FILE
echo "Database Statistics - $(date)" >> $OUTPUT_FILE
echo "======================================" >> $OUTPUT_FILE

# Connect to the database and get the list of tables
TABLES=$(mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SHOW TABLES" -s --skip-column-names)

# Loop through each table and get the row count, indexes, and size
for TABLE in $TABLES; do
  ROW_COUNT=$(mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT COUNT(*) FROM $TABLE" -s --skip-column-names)
  INDEXES=$(mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SHOW INDEX FROM $TABLE" -s --skip-column-names)
  TABLE_SIZE=$(mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) FROM information_schema.TABLES WHERE TABLE_SCHEMA = '$DB_NAME' AND TABLE_NAME = '$TABLE'" -s --skip-column-names)

  # Write the table information to the output file
  echo "Table: $TABLE" >> $OUTPUT_FILE
  echo "Row Count: $ROW_COUNT" >> $OUTPUT_FILE
  echo "Indexes:" >> $OUTPUT_FILE
  echo "$INDEXES" >> $OUTPUT_FILE
  echo "Table Size (MB): $TABLE_SIZE" >> $OUTPUT_FILE
  echo "" >> $OUTPUT_FILE
done