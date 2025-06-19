from fetch_utils import compress_html

input_file = ".generated_code/www.catonetworks.com.html"
output_file = ".generated_code/test_compressed.html"
with open(input_file, "r", encoding="utf-8") as f:
    html = f.read()

compressed_html = compress_html(html)

with open(output_file, "w", encoding="utf-8") as f:
    f.write(compressed_html)







