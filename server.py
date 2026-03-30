"""
Lead PJ — Paperjam Leads CRM
Static file server for Render deployment.
"""
import http.server
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()


port = int(os.environ.get("PORT", 8080))
server = http.server.HTTPServer(("0.0.0.0", port), Handler)
print(f"Lead PJ serving on port {port}")
server.serve_forever()
