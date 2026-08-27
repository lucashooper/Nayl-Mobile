import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import hapticService, { HapticType, HapticIntensity } from '../services/hapticService';

interface ProfessionalSignaturePadProps {
  style?: any;
  onSignatureChange?: (hasSignature: boolean) => void;
  onBegin?: () => void;
  onEnd?: () => void;
  strokeWidth?: number;
  strokeColor?: string;
  backgroundColor?: string;
}

interface SignaturePadRef {
  clearSignature: () => void;
  getSignature: () => string;
}

const ProfessionalSignaturePad = forwardRef<SignaturePadRef, ProfessionalSignaturePadProps>(({
  style,
  onSignatureChange,
  onBegin,
  onEnd,
  strokeWidth = 3,
  strokeColor = '#3B82F6',
  backgroundColor = 'rgba(255, 255, 255, 0.05)',
}, ref) => {
  const signatureCanvasRef = useRef<any>(null);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    onSignatureChange?.(hasSignature);
  }, [hasSignature, onSignatureChange]);

  const handleSignatureBegin = () => {
    hapticService.trigger(HapticType.SELECTION, HapticIntensity.SUBTLE);
    onBegin?.();
  };

  const handleSignatureEnd = () => {
    hapticService.trigger(HapticType.SELECTION, HapticIntensity.SUBTLE);
    onEnd?.();
  };

  const handleSignatureDraw = () => {
    if (!hasSignature) {
      setHasSignature(true);
    }
  };

  const handleSignatureEmpty = () => {
    setHasSignature(false);
  };

  const clearSignature = () => {
    signatureCanvasRef.current?.clearSignature?.();
    signatureCanvasRef.current?.clear?.();
    setHasSignature(false);
  };

  const getSignature = () => {
    if (signatureCanvasRef.current?.toDataURL) {
      return signatureCanvasRef.current.toDataURL();
    }
    return '';
  };

  useImperativeHandle(ref, () => ({
    clearSignature,
    getSignature,
  }));

  const webStyle = `
    .m-signature-pad {
      margin: 0;
      box-shadow: none;
      border: none;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }
    .m-signature-pad--body {
      border: none;
      touch-action: none;
    }
    .m-signature-pad--footer {
      display: none;
    }
    canvas {
      border-radius: 14px;
      border: none;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }
    body, html {
      margin: 0;
      padding: 0;
      overflow: hidden;
      touch-action: none;
    }
  `;

  return (
    <View style={[styles.container, style, { backgroundColor }]}>
      <SignatureCanvas
        ref={signatureCanvasRef}
        webStyle={webStyle}
        penColor={strokeColor}
        minWidth={strokeWidth}
        maxWidth={strokeWidth + 1}
        minDistance={Platform.OS === 'android' ? 0 : 5}
        backgroundColor="transparent"
        onBegin={handleSignatureBegin}
        onEnd={handleSignatureEnd}
        onDraw={handleSignatureDraw}
        onEmpty={handleSignatureEmpty}
        onClear={handleSignatureEmpty}
        autoClear={false}
        descriptionText=""
        clearText=""
        confirmText=""
        imageType="image/png"
        nestedScrollEnabled={false}
        androidLayerType="software"
        webviewProps={{
          androidHardwareAccelerationDisabled: true,
          overScrollMode: 'never',
          scrollEnabled: false,
          bounces: false,
        }}
        style={styles.signatureCanvas}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: '#0A0A0A',
  },
  signatureCanvas: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
});

export default ProfessionalSignaturePad;
