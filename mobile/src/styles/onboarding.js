'use strict'

import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    paddingTop: 0
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  legalContainer: {
    paddingTop: 20,
    paddingBottom: 30,
    width: '80%'
  },
  legal: {
    textAlign: 'center',
    color: '#98a7b4'
  },
  buttonsContainer: {
    width: '100%'
  },
  button: {
    marginBottom: 20,
    marginHorizontal: 50
  },
  title: {
    fontFamily: 'Lato',
    fontSize: 30,
    fontWeight: '600',
    marginHorizontal: 50,
    paddingBottom: 30,
    textAlign: 'center',
    color: '#293f55'
  },
  subtitle: {
    fontFamily: 'Lato',
    fontSize: 18,
    marginHorizontal: 30,
    paddingBottom: 10,
    textAlign: 'center',
    fontWeight: '300'
  },
  invalid: {
    borderColor: '#ff0000',
    color: '#ff0000'
  },
  input: {
    fontSize: 20,
    borderColor: '#c0cbd4',
    borderBottomWidth: 1,
    paddingTop: 20,
    paddingBottom: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
    textAlign: 'center',
    width: 300
  },
  visibilityWarningContainer: {
    borderColor: '#98a7b4',
    backgroundColor: 'rgba(152, 167, 180, 0.1)',
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 30,
    marginBottom: 20,
    width: '90%'
  },
  visibilityWarningHeader: {
    fontWeight: '600',
    paddingBottom: 5,
    textAlign: 'center'
  },
  visibilityWarningText: {
    textAlign: 'center'
  },
  termsHeader: {
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center'
  },
  termsText: {
    paddingHorizontal: 20,
    marginBottom: 20,
    color: '#111d28'
  },
  termsHighlightContainer: {
    borderColor: '#98a7b4',
    backgroundColor: 'rgba(152, 167, 180, 0.1)',
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginVertical: 20,
    width: '90%',
    borderRadius: 5
  },
  termsHighlightText: {
    color: '#6f8294'
  },
  isVisible: {
    borderColor: '#f4c110',
    backgroundColor: 'rgba(244, 193, 16, 0.1)'
  }
})
