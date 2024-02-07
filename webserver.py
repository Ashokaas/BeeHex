from http.server import SimpleHTTPRequestHandler
import socketserver

PORT = 8080

Handler = SimpleHTTPRequestHandler

httpd = socketserver.TCPServer(("0.0.0.0", PORT), Handler)

print("serving at port", PORT)
httpd.serve_forever()