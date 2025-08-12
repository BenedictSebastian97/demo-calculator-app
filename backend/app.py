from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://calculator:password@db:5432/calculator_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database model for calculation history
class CalculationHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    num1 = db.Column(db.Float, nullable=False)
    num2 = db.Column(db.Float, nullable=False)
    operation = db.Column(db.String(20), nullable=False)
    result = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'num1': self.num1,
            'num2': self.num2,
            'operation': self.operation,
            'result': self.result,
            'timestamp': self.timestamp.isoformat(),
            'expression': f"{self.num1} {self.get_operation_symbol()} {self.num2} = {self.result}"
        }
    
    def get_operation_symbol(self):
        symbols = {
            'add': '+',
            'subtract': '-',
            'multiply': '×',
            'divide': '÷'
        }
        return symbols.get(self.operation, self.operation)

@app.route('/api/calculate', methods=['POST'])
def calculate():
    try:
        data = request.get_json()
        operation = data.get('operation')
        num1 = float(data.get('num1', 0))
        num2 = float(data.get('num2', 0))
        
        result = None
        
        if operation == 'add':
            result = num1 + num2
        elif operation == 'subtract':
            result = num1 - num2
        elif operation == 'multiply':
            result = num1 * num2
        elif operation == 'divide':
            if num2 == 0:
                return jsonify({'error': 'Division by zero is not allowed'}), 400
            result = num1 / num2
        else:
            return jsonify({'error': 'Invalid operation'}), 400
        
        calculation = CalculationHistory(
            num1=num1,
            num2=num2,
            operation=operation,
            result=result
        )
        db.session.add(calculation)
        db.session.commit()
        
        return jsonify({'result': result})
    
    except ValueError:
        return jsonify({'error': 'Invalid number format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        # Get the last 20 calculations
        calculations = CalculationHistory.query.order_by(CalculationHistory.timestamp.desc()).limit(20).all()
        return jsonify([calc.to_dict() for calc in calculations])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/history', methods=['DELETE'])
def clear_history():
    try:
        CalculationHistory.query.delete()
        db.session.commit()
        return jsonify({'message': 'History cleared successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'Calculator API is running'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)