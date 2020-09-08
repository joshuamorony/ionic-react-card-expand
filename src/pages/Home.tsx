import { IonContent, IonPage } from '@ionic/react';
import React, { useState } from 'react';
import CardTransition from '../components/CardTransition';
import './Home.css';

const Home: React.FC = () => {

  const [cards] = useState(["Fiction", "Biography", "Classic", "Horror", "History"]);

  const demoContent = <span>
    <img alt="Bookshelf showing The Unlimited Dream Company" src="assets/florencia-viadana-unsplash.jpg" />
    <p>This card utilises the <strong>FLIP</strong> (First, Last, Invert, Play) concept to expand to a full screen size (and shrink back to its regular size) only using <strong>transforms</strong> for the animation.</p>
    <p>It also makes use of other interesting concepts from the Ionic Animations API like animation grouping, beforeStyles, afterStyles, afterAddWrite, and more.</p>
  </span>

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <h1>Category</h1>
        {cards.map((card, index) => (
          <CardTransition key={index} title={card} content={demoContent}></CardTransition>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default Home;
