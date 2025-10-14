def main():
    import http.server
    import socketserver
    import os

    web_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(web_dir)

    handler = http.server.SimpleHTTPRequestHandler
    port = 8000
    with socketserver.TCPServer(("127.0.0.1", port), handler) as httpd:
        print(f"Serving crane game at http://127.0.0.1:{port}/index.html")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
        finally:
            httpd.server_close()


if __name__ == "__main__":
    main()
