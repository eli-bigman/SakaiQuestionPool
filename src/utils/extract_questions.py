import xml.etree.ElementTree as ET
import argparse
import os
import sys
from pathlib import Path

def create_qti_structure():
    """Create the basic QTI XML structure"""
    root = ET.Element('questestinterop')
    root.set('xmlns', 'http://www.imsglobal.org/xsd/ims_qtiasiv1p2')
    root.set('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
    root.set('xsi:schemaLocation', 'http://www.imsglobal.org/xsd/ims_qtiasiv1p2 http://www.imsglobal.org/profile/cc/ccv1p2/ccv1p2_qtiasiv1p2p1_v1p0.xsd')
    
    return root

def extract_questions_by_title(input_file, title_pattern, output_dir=None, debug=False):
    """
    Extract questions from XML file based on title pattern
    
    Args:
        input_file (str): Path to the input XML file
        title_pattern (str): Pattern to search for in titles (case-insensitive)
        output_dir (str): Directory to save extracted files (optional)
        debug (bool): Enable debug output
    """
    try:
        # Parse the input XML file
        tree = ET.parse(input_file)
        root = tree.getroot()
        
        if debug:
            print(f"Root element: {root.tag}")
            print(f"Root attributes: {root.attrib}")
        
        # Find all objectbanks and items that match the title pattern
        matching_items = []
        
        # Search in objectbanks for items
        objectbanks = root.findall('.//objectbank')
        if debug:
            print(f"Found {len(objectbanks)} objectbanks")
        
        # Search in all items regardless of structure
        items = root.findall('.//item')
        if debug:
            print(f"Found {len(items)} items total")
            # Show first few items as sample
            for i, item in enumerate(items[:5]):
                title = item.get('title', '')
                ident = item.get('ident', '')
                print(f"Sample item {i+1}: '{title}' (ident: '{ident}')")
        
        for item in items:
            title = item.get('title', '')
            if title_pattern.lower() in title.lower():
                matching_items.append(item)
                if debug:
                    print(f"Found matching item: {title}")
        
        print(f"Found {len(matching_items)} matching items")
        
        if not matching_items:
            print(f"No items found with title containing '{title_pattern}'")
            
            # Additional debugging - show all unique title patterns
            all_titles = set()
            for item in items:
                title = item.get('title', '')
                if title:
                    all_titles.add(title)
            
            print(f"\nAll available titles ({len(all_titles)} unique):")
            for title in sorted(all_titles):
                print(f"  - {title}")
            return
        
        # Set output directory
        if output_dir is None:
            output_dir = os.path.dirname(input_file) if input_file else '.'
        
        # Ensure output directory exists
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        # Group matching items by title pattern for better organization
        grouped_items = {}
        for item in matching_items:
            title = item.get('title', 'Unknown')
            # Extract common prefix for grouping (first few words)
            title_parts = title.split()
            if len(title_parts) >= 2:
                group_key = ' '.join(title_parts[:2])  # Use first 2 words as group key
            else:
                group_key = title_parts[0] if title_parts else 'Miscellaneous'
            
            if group_key not in grouped_items:
                grouped_items[group_key] = []
            grouped_items[group_key].append(item)
        
        # Create files for each group
        for group_name, items_list in grouped_items.items():
            # Create new XML structure
            new_root = create_qti_structure()
            
            # Create objectbank
            objectbank = ET.SubElement(new_root, 'objectbank')
            objectbank.set('ident', f"{group_name.replace(' ', '_').upper()}_BANK")
            
            # Add items
            for item in items_list:
                # Create a deep copy of the item
                new_item = ET.fromstring(ET.tostring(item))
                objectbank.append(new_item)
            
            # Generate filename
            safe_title = "".join(c for c in group_name if c.isalnum() or c in (' ', '_', '-')).strip()
            safe_title = safe_title.replace(' ', '_')
            output_filename = f"Questions_{safe_title}.xml"
            output_path = os.path.join(output_dir, output_filename)
            
            # Write to file
            write_xml_file(new_root, output_path)
            print(f"Extracted {len(items_list)} items to: {output_path}")
    
    except ET.ParseError as e:
        print(f"Error parsing XML file: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

def write_xml_file(root, output_path):
    """Write XML tree to file with proper formatting"""
    # Add XML declaration and format
    tree = ET.ElementTree(root)
    ET.indent(tree, space="  ")
    
    # Write to file
    tree.write(output_path, encoding='utf-8', xml_declaration=True)

def list_available_titles(input_file, title_pattern=None):
    """List all available item titles in the XML file"""
    try:
        tree = ET.parse(input_file)
        root = tree.getroot()
        
        print(f"\nAvailable titles in '{input_file}':")
        print("=" * 50)
        
        # List all items
        items = root.findall('.//item')
        if items:
            print(f"\nITEMS (Total: {len(items)}):")
            
            if title_pattern:
                # Show only matching items
                matching_items = []
                for item in items:
                    title = item.get('title', 'No title')
                    if title_pattern.lower() in title.lower():
                        matching_items.append(title)
                
                print(f"Items containing '{title_pattern}' ({len(matching_items)}):")
                for title in sorted(set(matching_items)):
                    count = matching_items.count(title)
                    print(f"  - {title} ({count} items)")
            else:
                # Show all unique titles
                all_titles = []
                for item in items:
                    title = item.get('title', 'No title')
                    all_titles.append(title)
                
                unique_titles = set(all_titles)
                for title in sorted(unique_titles):
                    count = all_titles.count(title)
                    print(f"  - {title} ({count} items)")
        else:
            print("\nNo items found in the file")
    
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(
        description='Extract questions from QTI XML files based on title patterns',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Extract all questions with "DCIT 408" in the title
  python extract_questions.py "DCIT 408" "DCIT 201 programming 1.xml"
  
  # Extract to specific directory
  python extract_questions.py "DCIT 408" "DCIT 201 programming 1.xml" -o extracted_questions/
  
  # List all available titles
  python extract_questions.py --list "DCIT 201 programming 1.xml"
  
  # List titles containing specific pattern
  python extract_questions.py --list "DCIT 201 programming 1.xml" -p "DCIT 408"
  
  # Debug mode to see what's happening
  python extract_questions.py "DCIT 408" "DCIT 201 programming 1.xml" --debug
        """
    )
    
    parser.add_argument('title_pattern', nargs='?', 
                       help='Pattern to search for in titles (case-insensitive)')
    parser.add_argument('input_file', nargs='?',
                       help='Path to the input XML file')
    parser.add_argument('-o', '--output', dest='output_dir',
                       help='Output directory for extracted files (default: same as input file directory)')
    parser.add_argument('--list', action='store_true',
                       help='List all available titles in the XML file')
    parser.add_argument('-p', '--pattern', dest='list_pattern',
                       help='Pattern to filter titles when listing (use with --list)')
    parser.add_argument('--debug', action='store_true',
                       help='Enable debug output to troubleshoot issues')
    
    args = parser.parse_args()
    
    # Handle list command
    if args.list:
        if not args.input_file:
            if args.title_pattern and os.path.isfile(args.title_pattern):
                # If title_pattern is actually a file path
                list_available_titles(args.title_pattern, args.list_pattern)
            else:
                print("Error: Please provide an input XML file path")
                sys.exit(1)
        else:
            list_available_titles(args.input_file, args.list_pattern)
        return
    
    # Validate arguments for extraction
    if not args.title_pattern:
        print("Error: Please provide a title pattern to search for")
        parser.print_help()
        sys.exit(1)
    
    if not args.input_file:
        print("Error: Please provide an input XML file path")
        parser.print_help()
        sys.exit(1)
    
    if not os.path.isfile(args.input_file):
        print(f"Error: Input file '{args.input_file}' does not exist")
        sys.exit(1)
    
    # Extract questions
    print(f"Searching for titles containing: '{args.title_pattern}'")
    print(f"Input file: {args.input_file}")
    if args.output_dir:
        print(f"Output directory: {args.output_dir}")
    
    extract_questions_by_title(args.input_file, args.title_pattern, args.output_dir, args.debug)

if __name__ == "__main__":
    main()