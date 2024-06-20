#!/bin/bash

# Set the connection details
HOST="127.0.0.1"
PORT="3308"
USER="root"
PASSWORD="test"
DATABASE="insurance"

# Set the output file
OUTPUT_FILE="db_stats.info"

# Get the current date and time
CURRENT_DATE=$(date +"%Y-%m-%d %H:%M:%S")

# Write the header to the output file
echo "=============================================================" >> $OUTPUT_FILE
echo "Database Statistics - $CURRENT_DATE" >> $OUTPUT_FILE
echo "=============================================================" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "-----Table Name-----|-----Size in MB-----|-----Row Count-----" >> $OUTPUT_FILE

# Set the password as an environment variable
export MYSQL_PWD=$PASSWORD

# Connect to the database and get the list of tables
TABLES=$(mysql -h $HOST -P $PORT -u $USER $DATABASE -e "SHOW TABLES" -s --skip-column-names)

# Loop through each table and get the statistics
for TABLE in $TABLES; do
  # Get the row count
  ROW_COUNT=$(mysql -h $HOST -P $PORT -u $USER $DATABASE -e "SELECT COUNT(*) FROM $TABLE" -s --skip-column-names)

  # Get the indexes
  INDEXES=$(mysql -h $HOST -P $PORT -u $USER $DATABASE -e "SHOW INDEX FROM $TABLE" -s --skip-column-names)

  # Get the table size in MB
  TABLE_SIZE=$(mysql -h $HOST -P $PORT -u $USER $DATABASE -e "SELECT ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) FROM information_schema.TABLES WHERE TABLE_SCHEMA = '$DATABASE' AND TABLE_NAME = '$TABLE'" -s --skip-column-names)

  # Write the statistics to the output file
  printf "%-29s %-18s %-10s\n" "$TABLE" "$TABLE_SIZE" "$ROW_COUNT" >> $OUTPUT_FILE

done

echo "" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE