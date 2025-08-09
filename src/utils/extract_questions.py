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
    root.set('xsi:schemaLocation', 'http://www.imsglobal.org/xsd/ims_qtiasiv1p2 http://www.imsglobal.org/xsd/ims_qtiasiv1p2p1.xsd')
    
    return root

def extract_questions_by_title(input_file, title_pattern, output_dir=None):
    """
    Extract questions from XML file based on title pattern
    
    Args:
        input_file (str): Path to the input XML file
        title_pattern (str): Pattern to search for in titles (case-insensitive)
        output_dir (str): Directory to save extracted files (optional)
    """
    try:
        # Parse the input XML file
        tree = ET.parse(input_file)
        root = tree.getroot()
        
        # Find all sections and items that match the title pattern
        matching_sections = []
        matching_items = []
        
        # Search in sections
        for section in root.findall('.//section'):
            title = section.get('title', '')
            if title_pattern.lower() in title.lower():
                matching_sections.append(section)
                print(f"Found matching section: {title}")
        
        # Search in individual items if no sections found
        for item in root.findall('.//item'):
            title = item.get('title', '')
            if title_pattern.lower() in title.lower():
                matching_items.append(item)
        
        if not matching_sections and not matching_items:
            print(f"No sections or items found with title containing '{title_pattern}'")
            return
        
        # Set output directory
        if output_dir is None:
            output_dir = os.path.dirname(input_file) if input_file else '.'
        
        # Ensure output directory exists
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        # Process matching sections
        for section in matching_sections:
            section_title = section.get('title', 'Unknown')
            section_ident = section.get('ident', 'unknown_section')
            
            # Create new XML structure
            new_root = create_qti_structure()
            
            # Create assessment element
            assessment = ET.SubElement(new_root, 'assessment')
            assessment.set('ident', f"{section_ident}_EXTRACTED")
            assessment.set('title', f"Extracted: {section_title}")
            
            # Copy original metadata if exists
            original_assessment = root.find('.//assessment')
            if original_assessment is not None:
                original_metadata = original_assessment.find('assessmentmetadata')
                if original_metadata is not None:
                    assessment.append(original_metadata)
            
            # Create object bank to contain items
            objectbank = ET.SubElement(assessment, 'objectbank')
            objectbank.set('ident', f"{section_ident}_BANK")
            
            # Add all items from the section to objectbank
            items_found = 0
            for item in section.findall('.//item'):
                # Create a deep copy of the item
                new_item = ET.fromstring(ET.tostring(item))
                objectbank.append(new_item)
                items_found += 1
            
            if items_found > 0:
                # Generate filename
                safe_title = "".join(c for c in section_title if c.isalnum() or c in (' ', '_', '-')).strip()
                safe_title = safe_title.replace(' ', '_')
                output_filename = f"{safe_title}.xml"
                output_path = os.path.join(output_dir, output_filename)
                
                # Write to file
                write_xml_file(new_root, output_path)
                print(f"Extracted {items_found} items to: {output_path}")
            else:
                print(f"No items found in section: {section_title}")
        
        # Process individual matching items if no sections were found
        if not matching_sections and matching_items:
            # Group items by common title patterns
            grouped_items = {}
            for item in matching_items:
                title = item.get('title', 'Unknown')
                # Extract common prefix for grouping
                title_parts = title.split()
                if len(title_parts) >= 2:
                    group_key = ' '.join(title_parts[:3])  # Use first 3 words as group key
                else:
                    group_key = title_parts[0] if title_parts else 'Miscellaneous'
                
                if group_key not in grouped_items:
                    grouped_items[group_key] = []
                grouped_items[group_key].append(item)
            
            # Create files for each group
            for group_name, items in grouped_items.items():
                # Create new XML structure
                new_root = create_qti_structure()
                
                # Create assessment element
                assessment = ET.SubElement(new_root, 'assessment')
                assessment.set('ident', f"EXTRACTED_{group_name.replace(' ', '_').upper()}")
                assessment.set('title', f"Extracted: {group_name}")
                
                # Create object bank
                objectbank = ET.SubElement(assessment, 'objectbank')
                objectbank.set('ident', f"{group_name.replace(' ', '_').upper()}_BANK")
                
                # Add items
                for item in items:
                    new_item = ET.fromstring(ET.tostring(item))
                    objectbank.append(new_item)
                
                # Generate filename
                safe_title = "".join(c for c in group_name if c.isalnum() or c in (' ', '_', '-')).strip()
                safe_title = safe_title.replace(' ', '_')
                output_filename = f"Items_{safe_title}.xml"
                output_path = os.path.join(output_dir, output_filename)
                
                # Write to file
                write_xml_file(new_root, output_path)
                print(f"Extracted {len(items)} items to: {output_path}")
    
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
    """List all available section and item titles in the XML file"""
    try:
        tree = ET.parse(input_file)
        root = tree.getroot()
        
        print(f"\nAvailable titles in '{input_file}':")
        print("=" * 50)
        
        # List section titles
        sections = root.findall('.//section')
        if sections:
            print("\nSECTIONS:")
            for section in sections:
                title = section.get('title', 'No title')
                ident = section.get('ident', 'No ident')
                if title_pattern is None or title_pattern.lower() in title.lower():
                    print(f"  - {title} (ident: {ident})")
        
        # List unique item title patterns
        items = root.findall('.//item')
        if items:
            print(f"\nITEMS (Total: {len(items)}):")
            title_patterns = set()
            for item in items:
                title = item.get('title', 'No title')
                if title_pattern is None or title_pattern.lower() in title.lower():
                    # Extract pattern (first few words)
                    title_parts = title.split()
                    if len(title_parts) >= 3:
                        pattern = ' '.join(title_parts[:3])
                    else:
                        pattern = title
                    title_patterns.add(pattern)
            
            for pattern in sorted(title_patterns):
                count = len([item for item in items if item.get('title', '').startswith(pattern)])
                print(f"  - {pattern}... ({count} items)")
    
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(
        description='Extract questions from QTI XML files based on title patterns',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Extract all questions with "DCIT 318" in the title
  python extract_questions.py "DCIT 318" questions.xml
  
  # Extract to specific directory
  python extract_questions.py "DCIT 318" questions.xml -o extracted_questions/
  
  # List all available titles
  python extract_questions.py --list questions.xml
  
  # List titles containing specific pattern
  python extract_questions.py --list questions.xml -p "DCIT"
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
    
    extract_questions_by_title(args.input_file, args.title_pattern, args.output_dir)

if __name__ == "__main__":
    main()