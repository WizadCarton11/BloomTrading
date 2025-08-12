run_backend:
	cd web/backend && npm run dev
run_frontend:
	cd ../dark-bloom-trading && npm run dev
run_ds:
	cd ../../ML && python3 -m uvicorn server:app --reload
run_ai:
	cd ../AI && python3 -m uvicorn server:app --reload
# .PHONY: run_all_tabs

# run_all_tabs:
# 	@gnome-terminal --tab --title="Backend"    -- bash -c "cd web/backend && npm run dev; exec bash" &
# 	@gnome-terminal --tab --title="Frontend"   -- bash -c "cd web/dark-bloom-trading && npm run dev; exec bash" &
# 	@gnome-terminal --tab --title="DS Service" -- bash -c "cd ML && python3 -m uvicorn server:app --reload; exec bash" &
# 	@gnome-terminal --tab --title="AI Service" -- bash -c "cd AI/stock_market_basics_bot && python3 -m uvicorn server:app --reload; exec bash" &

.PHONY: run_all_tabs

run_all_tabs:
	@echo "🚀 Launching Backend..."
	@gnome-terminal --tab --title="Backend" -- bash -c "cd web/backend && npm run dev; exec bash" &

	@echo "🚀 Launching Frontend..."
	@gnome-terminal --tab --title="Frontend" -- bash -c "cd web/dark-bloom-trading && npm run dev; exec bash" &

	@echo "🚀 Launching DS Service..."
	@gnome-terminal --tab --title="DS Service" -- bash -c "cd ML && python3 -m uvicorn server:app --reload; exec bash" &

	@echo "🚀 Launching AI Service..."
	@gnome-terminal --tab --title="AI Service" -- bash -c "cd AI/stock_market_basics_bot && source .venv/bin/activate && python3 server.py; exec bash" &

.PHONY: free-ports

PORTS := 6080, 3000, 3001, 3002, 3003

free-ports:
	@for port in $(PORTS); do \
		echo "🔍 Checking port $$port..."; \
		if lsof -i :$$port -t > /dev/null; then \
			PID=$$(lsof -i :$$port -t); \
			echo "⚠️  Port $$port is in use by PID $$PID. Killing..."; \
			kill -9 $$PID; \
			echo "✅ Freed port $$port."; \
		else \
			echo "✅ Port $$port is already free."; \
		fi; \
	done
