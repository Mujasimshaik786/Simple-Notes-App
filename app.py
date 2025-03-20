from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os

app = Flask(__name__)

db_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), "notes.db")
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate=Migrate(app,db)

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content=db.Column(db.Text,nullable=False)
    important=db.Column(db.Boolean,default=False)
with app.app_context():
    db.create_all()



@app.route('/get_notes',methods=['GET'])
def get_notes():
    notes = Note.query.all()
    notes_data = [{"id": note.id, "title": note.title, "content": note.content} for note in notes]
    return jsonify({"notes": notes_data})

# Home route
@app.route('/')
def home():
    notes = Note.query.all()
    return render_template('index.html', notes=notes)


# Add note feature
@app.route('/add', methods=['POST'])
def add_note():
    try:
        title = request.form.get('title')
        content = request.form.get('content')
        print("Recieved:",title,content)
        if title and content:
            new_note = Note(title=title, content=content)
            db.session.add(new_note)
            db.session.commit()
            return redirect(url_for('home'))
    except Exception as e:
        print("Error adding note:", e)
    return redirect(url_for('home'))

# Delete feature
@app.route('/delete/<int:id>', methods=['POST'])
def delete_note(id):
    try:
        note = Note.query.get(id)
        if note:
            db.session.delete(note)
            db.session.commit()
            return jsonify({'success': True})
    except Exception as e:
        print("Error deleting note:", e)
    return jsonify({'success': False}), 404

# Edit feature
@app.route('/edit/<int:id>', methods=['POST'])
def edit_note(id):
    try:
        note = Note.query.get(id)
        if note:
            note.title = request.form.get('title')
            note.content = request.form.get('content')
            db.session.commit()
            return jsonify({'success': True})
    except Exception as e:
        print("Error editing note:", e)
    return jsonify({'success': False}), 404



@app.route('/mark_important/<int:id>', methods=['POST'])
def mark_important(id):
    try:
        note = Note.query.get(id)
        if note:
            note.important = not note.important  # Toggle importance
            db.session.commit()
            return jsonify({'success': True, 'important': note.important})
    except Exception as e:
        print("Error marking note as important:", e)
    return jsonify({'success': False}), 404

# Main method
if __name__ == '__main__':
    app.run(debug=True,port=5000)