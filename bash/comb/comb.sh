#!/bin/bash

# Check if a directory path is provided as a command line argument
if [ -z "$1" ]; then
    echo "Error: Directory path is required as a command line argument."
    exit 1
fi

# Check if the provided path is a directory
if [ ! -d "$1" ]; then
    echo "Error: The provided path is not a directory."
    exit 1
fi

# Create the output file name by replacing slashes with underscores and appending "_comb.txt"
output_file=$(echo "$1" | tr '/' '_')"_comb.txt"

# Initialize the total size of the output file
total_size=0

# Function to process files recursively
process_files() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    
    # Skip hidden files
    if [ "${file_name:0:1}" == "." ]; then
        echo "Skipping $file_path (hidden file)"
        return
    fi
    
    # Check if the file is a regular file
    if [ -f "$file_path" ]; then
        # Get the file size in bytes
        file_size=$(stat -f%z "$file_path")
        
        # Skip files larger than 10 MB
        if [ $file_size -gt 10485760 ]; then
            echo "## Contents over 10MB and could not be added" >> "$output_file"
            echo "Skipping $file_path (file size exceeds 10 MB): $(printf "%.2f" $(bc -l <<< "scale=2; $file_size / 1048576")) MB"
            return
        fi
        
        # Check if the file is binary or a zip/gz file
        if [ "$(file --mime-type -b "$file_path")" == "application/octet-stream" ]; then
            echo "Skipping $file_path (binary file)"
            return
        elif [ "${file_path: -4}" == ".zip" ]; then
            echo "Skipping $file_path (zip file)"
            return
        elif [ "${file_path: -3}" == ".gz" ]; then
            echo "Skipping $file_path (gz file)"
            return
        fi
        
        # Append the file contents to the output file
        echo "==============================================" >> "$output_file"
        echo "Appending File: $file_path" >> "$output_file"
        echo "==============================================" >> "$output_file"
        cat "$file_path" >> "$output_file"
        
        # Update the total size of the output file
        total_size=$((total_size + file_size))
        
        # Check if the output file size exceeds 100 MB
        if [ $total_size -gt 104857600 ]; then
            echo "Output file size exceeded 100 MB. Further files will not be appended." >&2
            echo "Could not append $file_path ($(printf "%.2f" $(bc -l <<< "scale=2; $file_size / 1048576")) MB)" >&2
        else
            echo "Appended $file_path ($(printf "%.2f" $(bc -l <<< "scale=2; $file_size / 1048576")) MB)" >&2
        fi
    elif [ -d "$file_path" ]; then
        # Recursively process files in subdirectories
        for entry in "$file_path"/*; do
            process_files "$entry"
        done
    fi
}

# Start processing files from the given directory
shopt -s dotglob
for entry in "$1"/*; do
    process_files "$entry"
done