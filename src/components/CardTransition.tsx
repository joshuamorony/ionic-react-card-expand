import React, { useRef, useEffect } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  createAnimation,
  Animation,
} from "@ionic/react";
import { close as closeIcon } from "ionicons/icons";
import "./CardTransition.css";

interface CardTransitionProps {
  title: any;
  content: any;
}

interface InternalValues {
  state: "initial" | "transitioning" | "expanded";
  toggleTitleAnimation?: Animation;
  visibleWhenOpenAnimations?: Animation;
}

const CardTransition: React.FC<CardTransitionProps> = (props: CardTransitionProps) => {
  const hostElement = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLIonCardElement>(null);
  const titleElement = useRef<HTMLIonCardTitleElement>(null);
  const closeElement = useRef<HTMLIonButtonElement>(null);
  const contentElement = useRef<HTMLIonCardContentElement>(null);

  const values = useRef<InternalValues>({
    state: "initial",
  });

  useEffect(() => {
    if (
      [hostElement, card, titleElement, closeElement, contentElement].every(
        (element) => element !== null
      )
    ) {
      const toggleTitleAnimation = createAnimation()
        .addElement(titleElement.current as HTMLElement)
        .duration(200)
        .fill("forwards")
        .easing("ease-in-out")
        .fromTo("opacity", "1", "0")
        .fromTo("transform", "translateX(0)", "translateX(-10px)");

      const visibleWhenOpenAnimations = createAnimation()
        .duration(200)
        .fill("forwards")
        .easing("ease-in-out");

      const toggleContentAnimation = createAnimation()
        .addElement(contentElement.current as HTMLElement)
        .fromTo("opacity", "0", "1")
        .fromTo("transform", "translateX(10px)", "translateX(0)");

      const toggleCloseAnimation = createAnimation()
        .addElement(closeElement.current as HTMLElement)
        .fromTo("opacity", "0", "0.8")
        .fromTo("transform", "translateX(10px)", "translateX(0)");

      values.current.toggleTitleAnimation = toggleTitleAnimation;
      values.current.visibleWhenOpenAnimations = visibleWhenOpenAnimations;
      values.current.visibleWhenOpenAnimations.addAnimation([
        toggleContentAnimation,
        toggleCloseAnimation,
      ]);

      // Cleanup
      return () => {
        toggleTitleAnimation.destroy();
        visibleWhenOpenAnimations.destroy();
      };
    }
  });

  const toggleCard = () => {
    if (values.current.state === "initial") {
      open();
    }

    if (values.current.state === "expanded") {
      close();
    }
  };

  const open = async () => {
    if (!values.current.toggleTitleAnimation) {
      return false;
    }

    values.current.state = "transitioning";
    values.current.toggleTitleAnimation.direction("normal");

    await values.current.toggleTitleAnimation.play();
    await expandCard();
    return (values.current.state = "expanded");
  };

  const close = async () => {
    if (!values.current.toggleTitleAnimation || !values.current.visibleWhenOpenAnimations) {
      return false;
    }

    values.current.state = "transitioning";
    values.current.toggleTitleAnimation.direction("normal");
    values.current.visibleWhenOpenAnimations.direction("reverse");

    await Promise.all([
      values.current.toggleTitleAnimation.play(),
      values.current.visibleWhenOpenAnimations.play(),
    ]);
    await shrinkCard();

    return (values.current.state = "initial");
  };

  const expandCard = async () => {
    if (!card.current) {
      return false;
    }

    // Get initial position
    const first = card.current.getBoundingClientRect();

    // Apply class to expand to final position
    card.current.classList.add("expanded-card");

    // Get final position
    const last = card.current.getBoundingClientRect();

    const invert = {
      x: first.left - last.left,
      y: first.top - last.top,
      scaleX: first.width / last.width,
      scaleY: first.height / last.height,
    };

    // Start from inverted position and transform to final position
    const expandAnimation: Animation = createAnimation()
      .addElement(card.current)
      .duration(300)
      .beforeStyles({
        ["transform-origin"]: "0 0",
      })
      .afterStyles({
        ["overflow"]: "scroll",
      })
      .beforeAddWrite(() => {
        if (hostElement.current !== null) {
          hostElement.current.style.zIndex = "2";
        }
      })
      .easing("ease-in-out")
      .fromTo(
        "transform",
        `translate(${invert.x}px, ${invert.y}px) scale(${invert.scaleX}, ${invert.scaleY})`,
        `translateY(0) scale(1, 1)`
      );

    expandAnimation.onFinish(() => {
      if (values.current.toggleTitleAnimation && values.current.visibleWhenOpenAnimations) {
        values.current.toggleTitleAnimation.direction("reverse");
        values.current.visibleWhenOpenAnimations.direction("normal");
        values.current.toggleTitleAnimation.play();
        values.current.visibleWhenOpenAnimations.play();
      }
    });

    await expandAnimation.play();
  };

  const shrinkCard = async () => {
    if (!card.current) {
      return false;
    }

    // Get initial position
    const first = card.current.getBoundingClientRect();

    // Reset styles
    card.current.classList.remove("expanded-card");

    // Get final position
    const last = card.current.getBoundingClientRect();

    const invert = {
      x: first.left - last.left,
      y: first.top - last.top,
      scaleX: first.width / last.width,
      scaleY: first.height / last.height,
    };

    const shrinkAnimation: Animation = createAnimation()
      .addElement(card.current)
      .duration(300)
      .beforeClearStyles(["overflow"])
      .afterAddWrite(() => {
        if (hostElement.current !== null) {
          hostElement.current.style.zIndex = "1";
        }
      })
      .easing("ease-in-out")
      .fromTo(
        "transform",
        `translate(${invert.x}px, ${invert.y}px) scale(${invert.scaleX}, ${invert.scaleY})`,
        `translateY(0) scale(1, 1)`
      );

    shrinkAnimation.onFinish(() => {
      if (values.current.toggleTitleAnimation) {
        values.current.toggleTitleAnimation.direction("reverse");
        values.current.toggleTitleAnimation.play();
      }
    });

    await shrinkAnimation.play();
  };

  return (
    <div ref={hostElement} className="card-container">
      <div className="card-placeholder">
        <IonCard ref={card} button={true} onClick={() => toggleCard()}>
          <IonCardHeader>
            <IonCardTitle ref={titleElement}>{props.title}</IonCardTitle>
            <IonButton ref={closeElement} fill="clear">
              <IonIcon icon={closeIcon} slot="icon-only" color="light"></IonIcon>
            </IonButton>
          </IonCardHeader>
          <IonCardContent ref={contentElement}>{props.content}</IonCardContent>
        </IonCard>
      </div>
    </div>
  );
};

export default CardTransition;
