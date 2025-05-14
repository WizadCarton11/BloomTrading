ALTER TABLE basic_stock_info_chat_history 
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;


CREATE OR REPLACE FUNCTION maintain_chat_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete the oldest record if more than 5 exist for the same session_id
    DELETE FROM basic_stock_info_chat_history
    WHERE id IN (
        SELECT id FROM basic_stock_info_chat_history
        WHERE session_id = NEW.session_id
        ORDER BY created_at ASC
        LIMIT 1
    )
    AND (SELECT COUNT(*) FROM basic_stock_info_chat_history WHERE session_id = NEW.session_id) > 5;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run the function after every insert
CREATE TRIGGER trigger_maintain_chat_history
AFTER INSERT ON basic_stock_info_chat_history
FOR EACH ROW
EXECUTE FUNCTION maintain_chat_history();
