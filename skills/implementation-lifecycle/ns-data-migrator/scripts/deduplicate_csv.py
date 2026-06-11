import csv
import sys
import os

def deduplicate(input_file, key_column):
    seen = set()
    rows = []
    duplicates_found = 0

    if not os.path.exists(input_file):
        print(f"Error: File {input_file} not found.")
        return

    with open(input_file, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            val = row[key_column]
            if val in seen:
                duplicates_found += 1
            else:
                seen.add(val)
                rows.append(row)

    output_file = input_file.replace('.csv', '_deduped.csv')
    with open(output_file, mode='w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Success: Processed {len(rows) + duplicates_found} rows.")
    print(f"Duplicates removed: {duplicates_found}")
    print(f"Cleaned file saved to: {output_file}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python deduplicate_csv.py <file_path> <key_column_name>")
    else:
        deduplicate(sys.argv[1], sys.argv[2])
